import type { FastifyInstance } from "fastify";
import { updateResourcesController } from "./controller.js";

export function registerResourceRoutes(app: FastifyInstance) {
  app.put("/:id/resources", updateResourcesController);
}
