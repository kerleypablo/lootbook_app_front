import type { FastifyInstance } from "fastify";
import { updateStatsController } from "./controller.js";

export function registerStatRoutes(app: FastifyInstance) {
  app.put("/:id/stats", updateStatsController);
}
