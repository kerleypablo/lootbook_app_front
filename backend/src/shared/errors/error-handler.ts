import type { FastifyError, FastifyInstance } from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "./app-error.js";

export type ApiErrorResponse = {
  statusCode: number;
  error: string;
  message: string;
  details: unknown | null;
  requestId: string;
};

function sendError(
  reply: FastifyReply,
  request: FastifyRequest,
  statusCode: number,
  error: string,
  message: string,
  details?: unknown,
) {
  const payload: ApiErrorResponse = {
    statusCode,
    error,
    message,
    details: details ?? null,
    requestId: request.id,
  };

  return reply.status(statusCode).send(payload);
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setNotFoundHandler((request, reply) => {
    request.log.warn(
      {
        method: request.method,
        url: request.url,
      },
      "Route not found",
    );

    return sendError(reply, request, 404, "NotFoundError", "Route not found");
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

      return sendError(
        reply,
        request,
        error.statusCode,
        error.code,
        error.message,
        error.details,
      );
    }

    if ("validation" in error) {
      request.log.warn(
        {
          message: error.message,
          validation: error.validation,
        },
        "Request validation failed",
      );

      return sendError(reply, request, 400, "ValidationError", error.message, error.validation);
    }

    if (typeof error.statusCode === "number" && error.statusCode >= 400 && error.statusCode < 500) {
      request.log.warn(
        { errorCode: error.code, statusCode: error.statusCode },
        "Request could not be processed",
      );
      return sendError(reply, request, error.statusCode, "RequestError", error.message);
    }

    request.log.error({ err: error }, "Unexpected server error");

    return sendError(reply, request, 500, "InternalServerError", "Unexpected server error");
  });
}
