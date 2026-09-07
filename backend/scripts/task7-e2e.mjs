import "dotenv/config";
import { randomBytes } from "node:crypto";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const supabaseUrl = requireEnv("SUPABASE_URL").replace(/\/$/, "");
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || requireEnv("SUPABASE_ANON_KEY");
const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const suffix = `${Date.now()}-${randomBytes(4).toString("hex")}`;
const password = `Lootbook-task7-${randomBytes(18).toString("base64url")}!`;
const accounts = ["a", "b"].map((label) => ({
  email: `lootbook-task7-${suffix}-${label}@example.com`,
  displayName: `Lootbook Task 7 ${label.toUpperCase()}`,
}));
const authUserIds = [];
let app;

async function supabaseRequest(path, { method = "GET", body, admin = false } = {}) {
  const apiKey = admin ? serviceRoleKey : publishableKey;
  const response = await fetch(`${supabaseUrl}${path}`, {
    method,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase ${method} ${path} failed with ${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function createAuthUser(account) {
  const user = await supabaseRequest("/auth/v1/admin/users", {
    method: "POST",
    admin: true,
    body: { email: account.email, password, email_confirm: true, user_metadata: { display_name: account.displayName } },
  });
  authUserIds.push(user.id);
}

async function signIn(account) {
  const session = await supabaseRequest("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: { email: account.email, password },
  });
  return session.access_token;
}

function api(method, url, token, payload) {
  return app.inject({
    method,
    url,
    headers: { authorization: `Bearer ${token}` },
    ...(payload !== undefined ? { payload } : {}),
  });
}

async function expectStatus(method, url, token, payload, status) {
  const response = await api(method, url, token, payload);
  assert(response.statusCode === status, `${method} ${url} expected ${status}, received ${response.statusCode}: ${response.body}`);
  return response;
}

async function cleanup() {
  let databaseCleanupError;
  if (app) {
    try {
      if (authUserIds.length > 0) {
        await app.prisma.user.deleteMany({ where: { authProviderId: { in: authUserIds } } });
      }
    } catch (error) {
      databaseCleanupError = error;
    } finally {
      await app.close();
    }
  }
  for (const userId of authUserIds) {
    await supabaseRequest(`/auth/v1/admin/users/${userId}`, { method: "DELETE", admin: true });
  }
  if (databaseCleanupError) throw databaseCleanupError;
}

async function run() {
  process.env.NODE_ENV = "test";
  process.env.AUTH_REQUIRED = "true";
  const { createApp } = await import("../dist/app/create-app.js");
  app = await createApp();
  await app.ready();

  await Promise.all(accounts.map(createAuthUser));
  const [tokenA, tokenB] = await Promise.all(accounts.map(signIn));
  const character = (await expectStatus("POST", "/characters", tokenA, { name: `Task 7 E2E ${suffix}` }, 201)).json().character;
  const characterId = character.id;

  await expectStatus("PUT", `/characters/${characterId}/stats`, tokenA, {
    stats: [{ key: "defense", label: "Defense", baseValue: 10, currentValue: 10 }],
  }, 200);
  await expectStatus("PUT", `/characters/${characterId}/resources`, tokenA, {
    resources: [{ key: "mana", label: "Mana", currentValue: 8, maxValue: 10 }],
  }, 200);
  await expectStatus("PUT", `/characters/${characterId}/notes`, tokenA, {
    notes: [{ section: "history", content: "A complete aggregated sheet." }],
  }, 200);
  const item = (await expectStatus("POST", `/characters/${characterId}/items`, tokenA, {
    name: "Shield", type: "ARMOR", equipped: true, quantity: 1, weight: 6,
  }, 201)).json().item;
  const action = (await expectStatus("POST", `/characters/${characterId}/actions`, tokenA, {
    name: "Guard", actionType: "SKILL",
  }, 201)).json().action;
  const effect = (await expectStatus("POST", `/characters/${characterId}/effects`, tokenA, {
    sourceType: "stance", sourceLabel: "Defensive", effectType: "BUFF", active: true,
    payloadJson: { operation: "ADD", target: { type: "STAT", id: "defense" }, value: 1 },
  }, 201)).json().effect;
  const link = (await expectStatus("POST", `/characters/${characterId}/links`, tokenA, {
    source: { type: "ITEM", id: item.id }, target: { type: "STAT", id: "defense" },
    operation: "ADD", configJson: { value: 2 },
  }, 201)).json().link;

  const initialSheet = (await expectStatus("GET", `/characters/${characterId}/sheet`, tokenA, undefined, 200)).json().sheet;
  assert(initialSheet.character.id === characterId, "Sheet must include the requested character");
  assert(initialSheet.stats.length === 1 && initialSheet.resources.length === 1, "Sheet must include stats and resources");
  assert(initialSheet.items[0].id === item.id && initialSheet.actions[0].id === action.id, "Sheet must include items and actions");
  assert(initialSheet.effects[0].id === effect.id && initialSheet.links[0].id === link.id, "Sheet must include effects and links");
  assert(initialSheet.notes[0].section === "history", "Sheet must include notes");
  assert(initialSheet.derivedState.stats.defense.currentValue === 13, "Sheet must calculate links and active effects");
  assert(initialSheet.latestSnapshot === null, "A sheet read must not mutate data by creating a snapshot");

  const firstRecalculation = (await expectStatus("POST", `/characters/${characterId}/recalculate`, tokenA, undefined, 200)).json();
  const secondRecalculation = (await expectStatus("POST", `/characters/${characterId}/recalculate`, tokenA, undefined, 200)).json();
  assert(firstRecalculation.snapshot.version === 1, "First recalculation must create snapshot version 1");
  assert(secondRecalculation.snapshot.version === 2, "Snapshots must be versioned sequentially");
  assert(secondRecalculation.state.stats.defense.currentValue === 13, "Snapshot must preserve the derived state returned by recalculation");

  const sheetAfterSnapshot = (await expectStatus("GET", `/characters/${characterId}/sheet`, tokenA, undefined, 200)).json().sheet;
  assert(sheetAfterSnapshot.latestSnapshot.version === 2, "Sheet must expose the latest persisted snapshot");
  assert(sheetAfterSnapshot.latestSnapshot.derivedStateJson.stats.defense.currentValue === 13, "Latest snapshot must contain derived state");
  await expectStatus("GET", `/characters/${characterId}/sheet`, tokenB, undefined, 404);

  console.log("PASS aggregated sheet returns every character entity and fresh derived state");
  console.log("PASS recalculation persists ordered derived-state snapshots");
  console.log("PASS sheet access remains protected by character ownership");
}

try {
  await run();
} finally {
  await cleanup();
}
