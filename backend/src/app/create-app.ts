import Fastify from "fastify";
import { registerCoreRoutes } from "./routes.js";
import { prismaPlugin } from "../shared/plugins/prisma.js";
import { registerErrorHandler } from "../shared/errors/error-handler.js";
import { loggerConfig } from "../shared/config/logger.js";
import { authPlugin } from "../shared/plugins/auth.js";

export async function createApp() {
  const app = Fastify({
    logger: loggerConfig,
  });

  await app.register(prismaPlugin);
  await app.register(authPlugin);
  registerErrorHandler(app);
  await registerCoreRoutes(app);

  return app;
}
