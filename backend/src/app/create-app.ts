import Fastify from "fastify";
import { env } from "../shared/config/env.js";
import { registerCoreRoutes } from "./routes.js";
import { prismaPlugin } from "../shared/plugins/prisma.js";
import { registerErrorHandler } from "../shared/errors/error-handler.js";

export async function createApp() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
  });

  await app.register(prismaPlugin);
  registerErrorHandler(app);
  registerCoreRoutes(app);

  return app;
}
