import type { FastifyInstance } from "fastify";
import { getCharacterSheetController } from "./controller.js";

export function registerSnapshotRoutes(app: FastifyInstance) {
  app.get("/:id/sheet", getCharacterSheetController);
}
