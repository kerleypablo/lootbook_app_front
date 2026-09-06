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
const publishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY || requireEnv("SUPABASE_ANON_KEY");
const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const suffix = `${Date.now()}-${randomBytes(4).toString("hex")}`;
const password = `Lootbook-rls-${randomBytes(18).toString("base64url")}!`;
const accounts = ["a", "b"].map((label) => ({
  email: `lootbook-rls-${suffix}-${label}@example.com`,
  displayName: `Lootbook RLS ${label.toUpperCase()}`,
}));
const authUserIds = [];
let app;

async function request(path, { method = "GET", body, token, admin = false, prefer } = {}) {
  const apiKey = admin ? serviceRoleKey : publishableKey;
  const response = await fetch(`${supabaseUrl}${path}`, {
    method,
    headers: {
      apikey: apiKey,
      ...(admin
        ? { Authorization: `Bearer ${serviceRoleKey}` }
        : token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      ...(body ? { "content-type": "application/json" } : {}),
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  return { response, payload, text };
}

async function successfulRequest(path, options) {
  const result = await request(path, options);
  if (!result.response.ok) {
    throw new Error(
      `${options?.method || "GET"} ${path} failed with ${result.response.status}: ${result.text}`,
    );
  }
  return result.payload;
}

async function createAuthUser(account) {
  const user = await successfulRequest("/auth/v1/admin/users", {
    method: "POST",
    admin: true,
    body: {
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: { display_name: account.displayName },
    },
  });
  authUserIds.push(user.id);
  return user;
}

async function signIn(account) {
  const session = await successfulRequest("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: { email: account.email, password },
  });
  return session.access_token;
}

async function cleanup() {
  if (app) {
    if (authUserIds.length > 0) {
      await app.prisma.user.deleteMany({
        where: { authProviderId: { in: authUserIds } },
      });
    }
    await app.close();
  }
  for (const userId of authUserIds) {
    await successfulRequest(`/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      admin: true,
    });
  }
}

async function run() {
  process.env.NODE_ENV = "test";
  process.env.AUTH_REQUIRED = "true";
  const { createApp } = await import("../dist/app/create-app.js");
  app = await createApp();
  await app.ready();

  const anonymousTemplates = await successfulRequest(
    "/rest/v1/character_templates?select=id,key,is_official",
  );
  assert(anonymousTemplates.length > 0, "Anon must see an official template");
  assert(
    anonymousTemplates.every((template) => template.is_official === true),
    "Anon received a non-official template",
  );

  const [authUserA, authUserB] = await Promise.all(accounts.map(createAuthUser));
  const [tokenA, tokenB] = await Promise.all(accounts.map(signIn));

  for (const token of [tokenA, tokenB]) {
    const response = await app.inject({
      method: "POST",
      url: "/auth/session/validate",
      headers: { authorization: `Bearer ${token}` },
    });
    assert(response.statusCode === 200, "Backend user synchronization failed");
  }

  const internalUsersA = await successfulRequest(
    "/rest/v1/users?select=id,auth_provider_id,email",
    { token: tokenA },
  );
  const internalUsersB = await successfulRequest(
    "/rest/v1/users?select=id,auth_provider_id,email",
    { token: tokenB },
  );
  assert(
    internalUsersA.length === 1 && internalUsersA[0].auth_provider_id === authUserA.id,
    "User A must only read its own internal user",
  );
  assert(
    internalUsersB.length === 1 && internalUsersB[0].auth_provider_id === authUserB.id,
    "User B must only read its own internal user",
  );

  const created = await app.inject({
    method: "POST",
    url: "/characters",
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { name: `RLS E2E ${suffix}` },
  });
  assert(created.statusCode === 201, "Backend failed to create user A's character");
  const characterId = created.json().character.id;

  const ownCharacters = await successfulRequest(
    `/rest/v1/characters?id=eq.${characterId}&select=id,name,user_id`,
    { token: tokenA },
  );
  const foreignCharacters = await successfulRequest(
    `/rest/v1/characters?id=eq.${characterId}&select=id`,
    { token: tokenB },
  );
  assert(ownCharacters.length === 1, "User A must read its own character");
  assert(foreignCharacters.length === 0, "User B read user A's character");

  const updatedByA = await successfulRequest(
    `/rest/v1/characters?id=eq.${characterId}`,
    {
      method: "PATCH",
      token: tokenA,
      prefer: "return=representation",
      body: { name: `RLS E2E updated ${suffix}` },
    },
  );
  assert(updatedByA.length === 1, "User A must update its own character");

  const updatedByB = await successfulRequest(
    `/rest/v1/characters?id=eq.${characterId}`,
    {
      method: "PATCH",
      token: tokenB,
      prefer: "return=representation",
      body: { name: "RLS ownership bypass" },
    },
  );
  assert(updatedByB.length === 0, "User B updated user A's character");

  const statByA = await successfulRequest("/rest/v1/character_stats", {
    method: "POST",
    token: tokenA,
    prefer: "return=representation",
    body: {
      character_id: characterId,
      key: "rls-e2e",
      label: "RLS E2E",
      updated_at: new Date().toISOString(),
    },
  });
  assert(statByA.length === 1, "User A must insert a child row on its character");

  const foreignInsert = await request("/rest/v1/character_stats", {
    method: "POST",
    token: tokenB,
    prefer: "return=representation",
    body: {
      character_id: characterId,
      key: "rls-bypass",
      label: "Must fail",
      updated_at: new Date().toISOString(),
    },
  });
  assert(
    foreignInsert.response.status === 403,
    `User B child insert should return 403, received ${foreignInsert.response.status}`,
  );

  const policyCounts = await app.prisma.$queryRawUnsafe(`
    SELECT tablename, count(*)::int AS count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'users', 'character_templates', 'characters', 'character_stats',
        'character_resources', 'character_items', 'character_actions',
        'character_effects', 'character_links', 'character_notes',
        'character_snapshots'
      )
    GROUP BY tablename
  `);
  assert(policyCounts.length === 11, "All 11 tables must have explicit policies");
  assert(
    policyCounts.every(({ tablename, count }) =>
      tablename === "users" || tablename === "character_templates"
        ? count === 1
        : count === 4,
    ),
    "Unexpected policy count",
  );

  console.log("PASS anon reads only official templates");
  console.log("PASS two authenticated users read only their internal identity");
  console.log("PASS character SELECT and UPDATE enforce ownership");
  console.log("PASS child INSERT enforces inherited ownership");
  console.log("PASS all 11 tables have the expected explicit policies");
}

try {
  await run();
} finally {
  await cleanup();
}
