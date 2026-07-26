import type { FastifyInstance } from "fastify";
import { createEffectController } from "./controller.js";

export async function registerEffectRoutes(app: FastifyInstance) {
  app.post("/:id/effects", createEffectController);
}
