import type { FastifyInstance } from "fastify";
import { createItemController, updateItemController } from "./controller.js";

export function registerItemRoutes(app: FastifyInstance) {
  app.post("/:id/items", createItemController);
  app.patch("/:id/items/:itemId", updateItemController);
}
