import type { FastifyInstance } from "fastify";
import { getMeController } from "./controller.js";

export function registerUserRoutes(app: FastifyInstance) {
  app.get("/me", getMeController);
}
