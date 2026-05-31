import type { FastifyInstance } from "fastify";
import { upsertNotesController } from "./controller.js";

export function registerNoteRoutes(app: FastifyInstance) {
  app.put("/:id/notes", upsertNotesController);
}
