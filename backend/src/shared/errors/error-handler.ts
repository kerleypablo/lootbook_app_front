import type { FastifyInstance } from "fastify";
import { AppError } from "./app-error.js";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.name,
        message: error.message,
        details: error.details ?? null,
      });
    }

    app.log.error(error);

    return reply.status(500).send({
      error: "InternalServerError",
      message: "Unexpected server error",
    });
  });
}
