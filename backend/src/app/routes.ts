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

export async function registerCoreRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    status: "ok",
    service: "lootbook-backend",
  }));

  await app.register(registerAuthRoutes, { prefix: "/auth" });
  await app.register(registerUserRoutes);
  await app.register(registerTemplateRoutes, { prefix: "/templates" });
  await app.register(registerCharacterRoutes, { prefix: "/characters" });
  await app.register(registerStatRoutes, { prefix: "/characters" });
  await app.register(registerResourceRoutes, { prefix: "/characters" });
  await app.register(registerItemRoutes, { prefix: "/characters" });
  await app.register(registerActionRoutes, { prefix: "/characters" });
  await app.register(registerEffectRoutes, { prefix: "/characters" });
  await app.register(registerLinkRoutes, { prefix: "/characters" });
  await app.register(registerNoteRoutes, { prefix: "/characters" });
  await app.register(registerSnapshotRoutes, { prefix: "/characters" });
}
