import type { FastifyInstance } from "fastify";
import { validateSessionController } from "./controller.js";
import { authSchemas } from "./schema.js";

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/session/validate", {
    preHandler: app.authenticate,
    schema: authSchemas.validateSession,
    handler: validateSessionController,
  });
}
