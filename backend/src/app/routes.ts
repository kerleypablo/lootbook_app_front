import type { FastifyInstance } from "fastify";
import { registerAuthRoutes } from "../modules/auth/route.js";
import { registerUserRoutes } from "../modules/users/route.js";
import { registerTemplateRoutes } from "../modules/templates/route.js";
import { registerCharacterRoutes } from "../modules/characters/route.js";
import { registerStatRoutes } from "../modules/stats/route.js";
import { registerResourceRoutes } from "../modules/resources/route.js";
import { registerItemRoutes } from "../modules/items/route.js";
import { registerActionRoutes } from "../modules/actions/route.js";
import { registerEffectRoutes } from "../modules/effects/route.js";
import { registerLinkRoutes } from "../modules/links/route.js";
import { registerNoteRoutes } from "../modules/notes/route.js";
import { registerSnapshotRoutes } from "../modules/snapshots/route.js";

export function registerCoreRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    status: "ok",
    service: "lootbook-backend",
  }));

  app.register(registerAuthRoutes, { prefix: "/auth" });
  app.register(registerUserRoutes);
  app.register(registerTemplateRoutes, { prefix: "/templates" });
  app.register(registerCharacterRoutes, { prefix: "/characters" });
  app.register(registerStatRoutes, { prefix: "/characters" });
  app.register(registerResourceRoutes, { prefix: "/characters" });
  app.register(registerItemRoutes, { prefix: "/characters" });
  app.register(registerActionRoutes, { prefix: "/characters" });
  app.register(registerEffectRoutes, { prefix: "/characters" });
  app.register(registerLinkRoutes, { prefix: "/characters" });
  app.register(registerNoteRoutes, { prefix: "/characters" });
  app.register(registerSnapshotRoutes, { prefix: "/characters" });
}
