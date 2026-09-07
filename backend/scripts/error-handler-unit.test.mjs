import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";

const [{ AppError }, { registerErrorHandler }] = await Promise.all([
  import("../dist/shared/errors/app-error.js"),
  import("../dist/shared/errors/error-handler.js"),
]);

async function appWithErrorHandling() {
  const app = Fastify({ logger: false });
  registerErrorHandler(app);
  app.get("/domain", async () => {
    throw new AppError(404, "Character not found", { characterId: "character-1" }, "CharacterNotFoundError");
  });
  app.get("/unexpected", async () => {
    throw new Error("database connection string should never be exposed");
  });
  app.post("/validated", {
    schema: {
      body: {
        type: "object",
        required: ["name"],
        additionalProperties: false,
        properties: { name: { type: "string", minLength: 1 } },
      },
    },
    handler: async () => ({ ok: true }),
  });
  await app.ready();
  return app;
}

function assertContract(response, expected) {
  const body = response.json();
  assert.equal(body.statusCode, response.statusCode);
  assert.equal(body.error, expected.error);
  assert.equal(body.message, expected.message);
  assert.deepEqual(body.details, expected.details);
  assert.equal(typeof body.requestId, "string");
  assert.ok(body.requestId.length > 0);
}

test("all public error paths expose the shared error contract", async () => {
  const app = await appWithErrorHandling();
  try {
    const domain = await app.inject({ method: "GET", url: "/domain" });
    assert.equal(domain.statusCode, 404);
    assertContract(domain, {
      error: "CharacterNotFoundError",
      message: "Character not found",
      details: { characterId: "character-1" },
    });

    const validation = await app.inject({ method: "POST", url: "/validated", payload: {} });
    assert.equal(validation.statusCode, 400);
    const validationBody = validation.json();
    assert.equal(validationBody.error, "ValidationError");
    assert.equal(validationBody.statusCode, 400);
    assert.ok(Array.isArray(validationBody.details));
    assert.equal(typeof validationBody.requestId, "string");

    const notFound = await app.inject({ method: "GET", url: "/missing-route" });
    assert.equal(notFound.statusCode, 404);
    assertContract(notFound, {
      error: "NotFoundError",
      message: "Route not found",
      details: null,
    });

    const unexpected = await app.inject({ method: "GET", url: "/unexpected" });
    assert.equal(unexpected.statusCode, 500);
    assertContract(unexpected, {
      error: "InternalServerError",
      message: "Unexpected server error",
      details: null,
    });
  } finally {
    await app.close();
  }
});
