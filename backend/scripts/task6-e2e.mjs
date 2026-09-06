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
const password = `Lootbook-task6-${randomBytes(18).toString("base64url")}!`;
const accounts = ["a", "b"].map((label) => ({
  email: `lootbook-task6-${suffix}-${label}@example.com`,
  displayName: `Lootbook Task 6 ${label.toUpperCase()}`,
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
  if (app) {
    if (authUserIds.length > 0) {
      await app.prisma.user.deleteMany({ where: { authProviderId: { in: authUserIds } } });
    }
    await app.close();
  }
  for (const userId of authUserIds) {
    await supabaseRequest(`/auth/v1/admin/users/${userId}`, { method: "DELETE", admin: true });
  }
}

async function createLink(characterId, token, payload) {
  const response = await expectStatus("POST", `/characters/${characterId}/links`, token, payload, 201);
  return response.json().link;
}

async function run() {
  process.env.NODE_ENV = "test";
  process.env.AUTH_REQUIRED = "true";
  const { createApp } = await import("../dist/app/create-app.js");
  app = await createApp();
  await app.ready();

  await Promise.all(accounts.map(createAuthUser));
  const [tokenA, tokenB] = await Promise.all(accounts.map(signIn));
  await Promise.all([tokenA, tokenB].map((token) => expectStatus("POST", "/auth/session/validate", token, undefined, 200)));

  const character = (await expectStatus("POST", "/characters", tokenA, { name: `Task 6 E2E ${suffix}` }, 201)).json().character;
  const characterId = character.id;

  await expectStatus("PUT", `/characters/${characterId}/stats`, tokenA, {
    stats: [
      { key: "strength", label: "Strength", baseValue: 4, currentValue: 4 },
      { key: "defense", label: "Defense", baseValue: 10, currentValue: 10 },
    ],
  }, 200);
  await expectStatus("PUT", `/characters/${characterId}/resources`, tokenA, {
    resources: [{ key: "mana", label: "Mana", currentValue: 10, maxValue: 10 }],
  }, 200);

  const item = (await expectStatus("POST", `/characters/${characterId}/items`, tokenA, {
    name: "Armor",
    type: "ARMOR",
    equipped: true,
    quantity: 2,
    weight: 2.5,
  }, 201)).json().item;
  const action = (await expectStatus("POST", `/characters/${characterId}/actions`, tokenA, {
    name: "Arcane action",
    actionType: "SPELL",
  }, 201)).json().action;
  const effect = (await expectStatus("POST", `/characters/${characterId}/effects`, tokenA, {
    sourceType: "condition",
    sourceLabel: "Inspired",
    effectType: "BUFF",
    payloadJson: {
      operation: "ADD",
      target: { type: "STAT", id: "defense" },
      value: 1,
    },
  }, 201)).json().effect;

  await expectStatus("POST", `/characters/${characterId}/links`, tokenA, {
    source: { type: "ITEM", id: item.id },
    target: { type: "STAT", id: "defense" },
    operation: "ADD",
    configJson: {},
  }, 400);

  const links = [];
  links.push(await createLink(characterId, tokenA, {
    source: { type: "ITEM", id: item.id },
    target: { type: "STAT", id: "defense" },
    operation: "ADD",
    configJson: { value: 3 },
  }));
  links.push(await createLink(characterId, tokenA, {
    source: { type: "EFFECT", id: effect.id },
    target: { type: "DERIVED", id: "penalty" },
    operation: "SUBTRACT",
    configJson: { value: 2 },
  }));
  links.push(await createLink(characterId, tokenA, {
    source: { type: "STAT", id: "strength" },
    target: { type: "DERIVED", id: "attack_bonus" },
    operation: "SET_FROM_STAT",
    configJson: { multiplier: 2, offset: 1 },
  }));
  links.push(await createLink(characterId, tokenA, {
    source: { type: "INVENTORY", id: "all" },
    target: { type: "DERIVED", id: "carried_weight" },
    operation: "SUM_WEIGHTS",
    configJson: { onlyEquipped: false },
  }));
  links.push(await createLink(characterId, tokenA, {
    source: { type: "ACTION", id: action.id },
    target: { type: "RESOURCE", id: "mana" },
    operation: "CONSUME_RESOURCE",
    configJson: { amount: 2, clampMin: 0 },
  }));

  const listed = (await expectStatus("GET", `/characters/${characterId}/links`, tokenA, undefined, 200)).json().links;
  assert(listed.length === 5, "All five links must be listed");
  await expectStatus("GET", `/characters/${characterId}/links`, tokenB, undefined, 404);
  await expectStatus("DELETE", `/characters/${characterId}/links/${links[0].id}`, tokenB, undefined, 404);

  const firstState = (await expectStatus("POST", `/characters/${characterId}/recalculate`, tokenA, undefined, 200)).json().state;
  const secondState = (await expectStatus("POST", `/characters/${characterId}/recalculate`, tokenA, undefined, 200)).json().state;
  assert(JSON.stringify(firstState) === JSON.stringify(secondState), "Recalculation must be deterministic");
  assert(firstState.stats.defense.currentValue === 14, "ADD link and active effect must produce defense 14");
  assert(firstState.derived.penalty === -2, "SUBTRACT must produce -2");
  assert(firstState.derived.attack_bonus === 9, "SET_FROM_STAT must produce 9");
  assert(firstState.derived.carried_weight === 5, "SUM_WEIGHTS must produce 5");
  assert(firstState.resources.mana.currentValue === 8, "CONSUME_RESOURCE must produce mana 8");
  assert(firstState.applied.length === 6 && firstState.warnings.length === 0, "Expected five links and one effect without warnings");
  await expectStatus("POST", `/characters/${characterId}/recalculate`, tokenB, undefined, 404);

  const persisted = await app.prisma.character.findUnique({
    where: { id: characterId },
    select: {
      stats: { where: { key: "defense" }, select: { currentValue: true } },
      resources: { where: { key: "mana" }, select: { currentValue: true } },
    },
  });
  assert(Number(persisted.stats[0].currentValue) === 10, "Recalculation must not mutate base stats");
  assert(Number(persisted.resources[0].currentValue) === 10, "Recalculation must not consume persisted resources");

  await expectStatus("DELETE", `/characters/${characterId}/items/${item.id}`, tokenA, undefined, 204);
  const staleState = (await expectStatus("POST", `/characters/${characterId}/recalculate`, tokenA, undefined, 200)).json().state;
  assert(staleState.warnings.some((warning) => warning.originId === links[0].id), "A stale source must produce a warning");

  await expectStatus("DELETE", `/characters/${characterId}/links/${links[0].id}`, tokenA, undefined, 204);
  const remaining = (await expectStatus("GET", `/characters/${characterId}/links`, tokenA, undefined, 200)).json().links;
  assert(remaining.length === 4, "Link deletion failed");

  console.log("PASS link create, list, validation, delete and ownership");
  console.log("PASS ADD, SUBTRACT, SET_FROM_STAT, SUM_WEIGHTS and CONSUME_RESOURCE");
  console.log("PASS active effects contribute to the derived state");
  console.log("PASS recalculation is deterministic and does not mutate base data");
  console.log("PASS stale references become warnings instead of failing the sheet");
}

try {
  await run();
} finally {
  await cleanup();
}
