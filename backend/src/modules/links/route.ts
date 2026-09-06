import type { FastifyInstance } from "fastify";
import {
  createLinkController,
  deleteLinkController,
  listLinksController,
  recalculateCharacterController,
} from "./controller.js";
import { linkSchemas } from "./schema.js";

export async function registerLinkRoutes(app: FastifyInstance) {
  app.post("/:id/links", {
    preHandler: app.authenticate,
    schema: linkSchemas.create,
    handler: createLinkController,
  });
  app.get("/:id/links", {
    preHandler: app.authenticate,
    schema: linkSchemas.list,
    handler: listLinksController,
  });
  app.delete("/:id/links/:linkId", {
    preHandler: app.authenticate,
    schema: linkSchemas.delete,
    handler: deleteLinkController,
  });
  app.post("/:id/recalculate", {
    preHandler: app.authenticate,
    schema: linkSchemas.recalculate,
    handler: recalculateCharacterController,
  });
}
