import type { FastifyInstance } from "fastify";
import { updateStatsController } from "./controller.js";
import { statSchemas } from "./schema.js";

export async function registerStatRoutes(app: FastifyInstance) {
  app.put("/:id/stats", {
    preHandler: app.authenticate,
    schema: statSchemas.replace,
    handler: updateStatsController,
  });
}
