import type { FastifyInstance } from "fastify";
import { listTemplatesController } from "./controller.js";

export function registerTemplateRoutes(app: FastifyInstance) {
  app.get("/", listTemplatesController);
}
