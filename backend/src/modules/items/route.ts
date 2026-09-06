import type { FastifyInstance } from "fastify";
import { createItemController, deleteItemController, listItemsController, updateItemController } from "./controller.js";
import { itemSchemas } from "./schema.js";

export async function registerItemRoutes(app: FastifyInstance) {
  app.post("/:id/items", { preHandler: app.authenticate, schema: itemSchemas.create, handler: createItemController });
  app.get("/:id/items", { preHandler: app.authenticate, schema: itemSchemas.list, handler: listItemsController });
  app.patch("/:id/items/:itemId", { preHandler: app.authenticate, schema: itemSchemas.update, handler: updateItemController });
  app.delete("/:id/items/:itemId", { preHandler: app.authenticate, schema: itemSchemas.delete, handler: deleteItemController });
}
