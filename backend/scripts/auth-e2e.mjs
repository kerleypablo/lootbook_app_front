import "dotenv/config";
import { randomBytes } from "node:crypto";

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const supabaseUrl = requireEnv("SUPABASE_URL").replace(/\/$/, "");
const publishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY || requireEnv("SUPABASE_ANON_KEY");
const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const suffix = `${Date.now()}-${randomBytes(4).toString("hex")}`;
const password = `Lootbook-e2e-${randomBytes(18).toString("base64url")}!`;
const accounts = [
  {
    email: `lootbook-e2e-${suffix}-a@example.com`,
    displayName: "Lootbook E2E A",
  },
  {
    email: `lootbook-e2e-${suffix}-b@example.com`,
    displayName: "Lootbook E2E B",
  },
];
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
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(
      `Supabase ${method} ${path} failed with ${response.status}: ${text}`,
    );
  }

  return payload;
}

async function createAuthUser(account) {
  const user = await supabaseRequest("/auth/v1/admin/users", {
    method: "POST",
    admin: true,
    body: {
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: { display_name: account.displayName },
    },
  });

  assert(typeof user.id === "string", "Supabase did not return the created user id");
  authUserIds.push(user.id);
  return user;
}

async function signIn(account) {
  const session = await supabaseRequest("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: { email: account.email, password },
  });

  assert(
    typeof session.access_token === "string",
    "Supabase did not return an access token",
  );
  return session.access_token;
}

function backendRequest(method, url, token, payload) {
  return app.inject({
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
    payload,
  });
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
    await supabaseRequest(`/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      admin: true,
    });
  }
}

async function run() {
  process.env.NODE_ENV = "test";
  process.env.AUTH_REQUIRED = "true";

  const [{ createApp }] = await Promise.all([import("../dist/app/create-app.js")]);
  app = await createApp();
  await app.ready();

  const missingToken = await backendRequest("POST", "/auth/session/validate");
  assert(missingToken.statusCode === 401, "Missing token must return 401");

  const malformedToken = await backendRequest(
    "POST",
    "/auth/session/validate",
    "not-a-jwt",
  );
  assert(malformedToken.statusCode === 401, "Malformed token must return 401");

  const authUserA = await createAuthUser(accounts[0]);
  const authUserB = await createAuthUser(accounts[1]);
  const [tokenA, tokenB] = await Promise.all(accounts.map(signIn));

  const tokenParts = tokenA.split(".");
  tokenParts[1] = `${tokenParts[1][0] === "a" ? "b" : "a"}${tokenParts[1].slice(1)}`;
  const tamperedToken = await backendRequest(
    "POST",
    "/auth/session/validate",
    tokenParts.join("."),
  );
  assert(tamperedToken.statusCode === 401, "Tampered token must return 401");

  const sessionA = await backendRequest(
    "POST",
    "/auth/session/validate",
    tokenA,
  );
  const sessionB = await backendRequest(
    "POST",
    "/auth/session/validate",
    tokenB,
  );
  assert(sessionA.statusCode === 200, "User A token must authenticate");
  assert(sessionB.statusCode === 200, "User B token must authenticate");

  const sessionBodyA = sessionA.json();
  const sessionBodyB = sessionB.json();
  assert(
    sessionBodyA.user.authProviderId === authUserA.id,
    "User A identity does not match the Supabase subject",
  );
  assert(
    sessionBodyB.user.authProviderId === authUserB.id,
    "User B identity does not match the Supabase subject",
  );
  assert(
    sessionBodyA.auth.verificationMethod === "jwks",
    "The ES256 access token was not verified through JWKS",
  );
  assert(sessionBodyA.auth.role === "authenticated", "Unexpected Supabase role");
  assert(
    typeof sessionBodyA.auth.sessionId === "string",
    "Supabase session id was not preserved",
  );

  const meA = await backendRequest("GET", "/me", tokenA);
  assert(meA.statusCode === 200, "GET /me must accept a valid token");
  assert(meA.json().user.email === accounts[0].email, "GET /me returned the wrong user");

  await backendRequest("POST", "/auth/session/validate", tokenA);
  const duplicateCount = await app.prisma.user.count({
    where: { authProviderId: authUserA.id },
  });
  assert(duplicateCount === 1, "Authenticated user synchronization created a duplicate");

  const created = await backendRequest("POST", "/characters", tokenA, {
    name: `Auth E2E ${suffix}`,
  });
  assert(created.statusCode === 201, "User A must be able to create a character");
  const characterId = created.json().character.id;

  const ownerRead = await backendRequest("GET", `/characters/${characterId}`, tokenA);
  assert(ownerRead.statusCode === 200, "User A must access their own character");

  const foreignRead = await backendRequest("GET", `/characters/${characterId}`, tokenB);
  assert(foreignRead.statusCode === 404, "User B must not access user A's character");

  const listB = await backendRequest("GET", "/characters", tokenB);
  assert(listB.statusCode === 200, "User B character list must be available");
  assert(
    !listB.json().characters.some((character) => character.id === characterId),
    "User A's character leaked into user B's list",
  );

  console.log("PASS missing token -> 401");
  console.log("PASS malformed token -> 401");
  console.log("PASS tampered token -> 401");
  console.log("PASS two real Supabase tokens authenticated");
  console.log("PASS ES256 token verified through JWKS with session context");
  console.log("PASS GET /me returned the correct user");
  console.log("PASS internal user synchronization remained unique");
  console.log("PASS character ownership isolated user A from user B");
}

try {
  await run();
} finally {
  await cleanup();
}
