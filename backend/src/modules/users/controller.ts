import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";

export async function getMeController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.user) {
    request.log.error(
      "Authenticated route reached controller without request.user",
    );

    throw new AppError(
      500,
      "Authenticated user context was not initialized",
      undefined,
      "AuthenticationContextError",
    );
  }

  return reply.status(200).send({
    user: request.user,
  });
}
