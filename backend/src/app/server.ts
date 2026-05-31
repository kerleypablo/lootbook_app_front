import { createApp } from "./create-app.js";
import { env } from "../shared/config/env.js";

async function start() {
  const app = await createApp();

  try {
    await app.listen({
      host: env.HOST,
      port: env.PORT,
    });

    app.log.info(`Lootbook backend running on http://${env.HOST}:${env.PORT}`);
  } catch (error) {
    app.log.error(error, "Failed to start backend");
    process.exit(1);
  }
}

void start();
