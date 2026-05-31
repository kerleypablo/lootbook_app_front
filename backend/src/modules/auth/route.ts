import type { FastifyInstance } from "fastify";
import { validateSessionController } from "./controller.js";

export function registerAuthRoutes(app: FastifyInstance) {
  app.post("/session/validate", validateSessionController);
}
