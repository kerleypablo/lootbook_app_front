import type { FastifyInstance } from "fastify";
import { listTemplatesController } from "./controller.js";
import { templateSchemas } from "./schema.js";

export async function registerTemplateRoutes(app: FastifyInstance) {
  app.get("/", { schema: templateSchemas.list }, listTemplatesController);
}
