import type { FastifyInstance } from "fastify";
import { updateResourcesController } from "./controller.js";
import { resourceSchemas } from "./schema.js";

export async function registerResourceRoutes(app: FastifyInstance) {
  app.put("/:id/resources", {
    preHandler: app.authenticate,
    schema: resourceSchemas.replace,
    handler: updateResourcesController,
  });
}
