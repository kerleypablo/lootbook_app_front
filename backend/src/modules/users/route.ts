import type { FastifyInstance } from "fastify";
import { getMeController } from "./controller.js";
import { userSchemas } from "./schema.js";

export async function registerUserRoutes(app: FastifyInstance) {
  app.get("/me", {
    preHandler: app.authenticate,
    schema: userSchemas.getMe,
    handler: getMeController,
  });
}
