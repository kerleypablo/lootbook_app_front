import type { FastifyInstance } from "fastify";
import { getCharacterSheetController } from "./controller.js";

export async function registerSnapshotRoutes(app: FastifyInstance) {
  app.get("/:id/sheet", getCharacterSheetController);
}
