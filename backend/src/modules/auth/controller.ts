import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";

export async function validateSessionController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.user || !request.auth) {
    request.log.error(
      "Authenticated route reached controller without request.user/request.auth",
    );

    throw new AppError(
      500,
      "Authenticated context was not initialized",
      undefined,
      "AuthenticationContextError",
    );
  }

  return reply.status(200).send({
    user: request.user,
    auth: request.auth,
  });
}
