import type { FastifyInstance } from "fastify";
import { getCharacterSheetController } from "./controller.js";
import { snapshotSchemas } from "./schema.js";

export async function registerSnapshotRoutes(app: FastifyInstance) {
  app.get("/:id/sheet", {
    preHandler: app.authenticate,
    schema: snapshotSchemas.sheet,
    handler: getCharacterSheetController,
  });
}
