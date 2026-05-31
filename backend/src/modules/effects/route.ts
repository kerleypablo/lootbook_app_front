import type { FastifyInstance } from "fastify";
import { createEffectController } from "./controller.js";

export function registerEffectRoutes(app: FastifyInstance) {
  app.post("/:id/effects", createEffectController);
}
