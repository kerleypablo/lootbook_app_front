import type { FastifyInstance } from "fastify";
import {
  createLinkController,
  deleteLinkController,
  recalculateCharacterController,
} from "./controller.js";

export function registerLinkRoutes(app: FastifyInstance) {
  app.post("/:id/links", createLinkController);
  app.delete("/:id/links/:linkId", deleteLinkController);
  app.post("/:id/recalculate", recalculateCharacterController);
}
