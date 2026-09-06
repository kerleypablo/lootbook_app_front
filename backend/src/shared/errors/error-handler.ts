import type { FastifyError, FastifyInstance } from "fastify";
import { AppError } from "./app-error.js";

export function registerErrorHandler(app: FastifyInstance) {
  app.setNotFoundHandler((request, reply) => {
    request.log.warn(
      {
        method: request.method,
        url: request.url,
      },
      "Route not found",
    );

    return reply.status(404).send({
      error: "NotFoundError",
      message: "Route not found",
    });
  });

  app.setErrorHandler<FastifyError | AppError>((error, request, reply) => {
    if (error instanceof AppError) {
      request.log.warn(
        {
          errorName: error.name,
          statusCode: error.statusCode,
          details: error.details ?? null,
        },
        error.message,
      );

      return reply.status(error.statusCode).send({
        error: error.name,
        message: error.message,
        details: error.details ?? null,
      });
    }

    if ("validation" in error) {
      request.log.warn(
        {
          message: error.message,
          validation: error.validation,
        },
        "Request validation failed",
      );

      return reply.status(400).send({
        error: "ValidationError",
        message: error.message,
        details: error.validation,
      });
    }

    request.log.error({ err: error }, "Unexpected server error");

    return reply.status(500).send({
      error: "InternalServerError",
      message: "Unexpected server error",
    });
  });
}
