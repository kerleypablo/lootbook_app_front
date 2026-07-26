import type { FastifyInstance } from "fastify";
import { upsertNotesController } from "./controller.js";
import { noteSchemas } from "./schema.js";

export async function registerNoteRoutes(app: FastifyInstance) {
  app.put("/:id/notes", {
    preHandler: app.authenticate,
    schema: noteSchemas.replace,
    handler: upsertNotesController,
  });
}
