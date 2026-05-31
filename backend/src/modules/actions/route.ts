import type { FastifyInstance } from "fastify";
import { createActionController, updateActionController } from "./controller.js";

export function registerActionRoutes(app: FastifyInstance) {
  app.post("/:id/actions", createActionController);
  app.patch("/:id/actions/:actionId", updateActionController);
}
