import type { FastifyInstance } from "fastify";
import { createEffectController, deleteEffectController, listEffectsController, updateEffectController } from "./controller.js";
import { effectSchemas } from "./schema.js";

export async function registerEffectRoutes(app: FastifyInstance) {
  app.post("/:id/effects", { preHandler: app.authenticate, schema: effectSchemas.create, handler: createEffectController });
  app.get("/:id/effects", { preHandler: app.authenticate, schema: effectSchemas.list, handler: listEffectsController });
  app.patch("/:id/effects/:effectId", { preHandler: app.authenticate, schema: effectSchemas.update, handler: updateEffectController });
  app.delete("/:id/effects/:effectId", { preHandler: app.authenticate, schema: effectSchemas.delete, handler: deleteEffectController });
}
