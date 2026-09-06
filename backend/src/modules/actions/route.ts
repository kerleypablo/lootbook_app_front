import type { FastifyInstance } from "fastify";
import { createActionController, deleteActionController, listActionsController, updateActionController } from "./controller.js";
import { actionSchemas } from "./schema.js";

export async function registerActionRoutes(app: FastifyInstance) {
  app.post("/:id/actions", { preHandler: app.authenticate, schema: actionSchemas.create, handler: createActionController });
  app.get("/:id/actions", { preHandler: app.authenticate, schema: actionSchemas.list, handler: listActionsController });
  app.patch("/:id/actions/:actionId", { preHandler: app.authenticate, schema: actionSchemas.update, handler: updateActionController });
  app.delete("/:id/actions/:actionId", { preHandler: app.authenticate, schema: actionSchemas.delete, handler: deleteActionController });
}
