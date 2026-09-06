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
const password = `Lootbook-task5-${randomBytes(18).toString("base64url")}!`;
const accounts = ["a", "b"].map((label) => ({
  email: `lootbook-task5-${suffix}-${label}@example.com`,
  displayName: `Lootbook Task 5 ${label.toUpperCase()}`,
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
  return user;
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

async function run() {
  process.env.NODE_ENV = "test";
  process.env.AUTH_REQUIRED = "true";
  const { createApp } = await import("../dist/app/create-app.js");
  app = await createApp();
  await app.ready();

  await Promise.all(accounts.map(createAuthUser));
  const [tokenA, tokenB] = await Promise.all(accounts.map(signIn));
  for (const token of [tokenA, tokenB]) {
    const session = await api("POST", "/auth/session/validate", token);
    assert(session.statusCode === 200, "Backend user synchronization failed");
  }

  const characterResponse = await api("POST", "/characters", tokenA, { name: `Task 5 E2E ${suffix}` });
  assert(characterResponse.statusCode === 201, "User A could not create a character");
  const characterId = characterResponse.json().character.id;

  const invalidItem = await api("POST", `/characters/${characterId}/items`, tokenA, {
    name: "Invalid metadata",
    type: "CUSTOM",
    metaJson: "must-be-an-object",
  });
  assert(invalidItem.statusCode === 400, "Item metaJson must reject primitive values");

  const itemResponse = await api("POST", `/characters/${characterId}/items`, tokenA, {
    name: "Espada modular",
    type: "WEAPON",
    quantity: 1,
    weight: 2.5,
    metaJson: { tags: ["melee"], systemFields: { rarity: "custom" } },
  });
  assert(itemResponse.statusCode === 201, "Item creation failed");
  const itemId = itemResponse.json().item.id;
  const updatedItem = await api("PATCH", `/characters/${characterId}/items/${itemId}`, tokenA, {
    equipped: true,
    metaJson: { tags: ["melee", "equipped"] },
  });
  assert(updatedItem.statusCode === 200 && updatedItem.json().item.equipped, "Item update failed");
  assert((await api("GET", `/characters/${characterId}/items`, tokenA)).json().items.length === 1, "Item list failed");
  assert((await api("GET", `/characters/${characterId}/items`, tokenB)).statusCode === 404, "User B listed user A's items");
  assert((await api("PATCH", `/characters/${characterId}/items/${itemId}`, tokenB, { quantity: 99 })).statusCode === 404, "User B updated user A's item");

  const invalidAction = await api("POST", `/characters/${characterId}/actions`, tokenA, {
    name: "Invalid action",
    actionType: "ATTACK",
    costJson: ["must", "be", "an", "object"],
  });
  assert(invalidAction.statusCode === 400, "Action costJson must reject arrays");

  const actionResponse = await api("POST", `/characters/${characterId}/actions`, tokenA, {
    name: "Golpe arcano",
    actionType: "CUSTOM",
    costJson: { resource: "mana", amount: 2 },
    rollJson: { expression: "1d20+focus" },
    damageJson: { expression: "2d6", damageType: "arcane" },
    metaJson: { tags: ["magic", "attack"] },
  });
  assert(actionResponse.statusCode === 201, "Action creation failed");
  const actionId = actionResponse.json().action.id;
  const updatedAction = await api("PATCH", `/characters/${characterId}/actions/${actionId}`, tokenA, {
    damageJson: { expression: "3d6", damageType: "arcane" },
  });
  assert(updatedAction.statusCode === 200, "Action update failed");
  assert((await api("GET", `/characters/${characterId}/actions`, tokenA)).json().actions.length === 1, "Action list failed");
  assert((await api("DELETE", `/characters/${characterId}/actions/${actionId}`, tokenB)).statusCode === 404, "User B deleted user A's action");

  const invalidEffect = await api("POST", `/characters/${characterId}/effects`, tokenA, {
    sourceType: "condition",
    sourceLabel: "Invalid",
    effectType: "DEBUFF",
    payloadJson: null,
  });
  assert(invalidEffect.statusCode === 400, "Effect payloadJson must require an object");

  const effectResponse = await api("POST", `/characters/${characterId}/effects`, tokenA, {
    sourceType: "condition",
    sourceLabel: "Inspirado",
    effectType: "BUFF",
    payloadJson: { target: "focus", operation: "ADD", value: 2 },
  });
  assert(effectResponse.statusCode === 201, "Effect creation failed");
  const effectId = effectResponse.json().effect.id;
  const updatedEffect = await api("PATCH", `/characters/${characterId}/effects/${effectId}`, tokenA, { active: false });
  assert(updatedEffect.statusCode === 200 && updatedEffect.json().effect.active === false, "Effect activation toggle failed");
  assert((await api("GET", `/characters/${characterId}/effects`, tokenA)).json().effects.length === 1, "Effect list failed");
  assert((await api("GET", `/characters/${characterId}/effects`, tokenB)).statusCode === 404, "User B listed user A's effects");

  assert((await api("DELETE", `/characters/${characterId}/items/${itemId}`, tokenA)).statusCode === 204, "Item deletion failed");
  assert((await api("DELETE", `/characters/${characterId}/actions/${actionId}`, tokenA)).statusCode === 204, "Action deletion failed");
  assert((await api("DELETE", `/characters/${characterId}/effects/${effectId}`, tokenA)).statusCode === 204, "Effect deletion failed");

  console.log("PASS item CRUD, validation and ownership");
  console.log("PASS action CRUD, flexible JSON fields and ownership");
  console.log("PASS effect CRUD, activation toggle and ownership");
  console.log("PASS two real Supabase users remained isolated");
}

try {
  await run();
} finally {
  await cleanup();
}
