import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { StatRepository } from "./repository.js";
import { StatService } from "./service.js";
import type { CharacterIdParams, ReplaceStatsInput } from "./types.js";

function getUserId(request: FastifyRequest): string {
  if (!request.user) {
    request.log.error("Stat route reached controller without request.user");
    throw new AppError(
      500,
      "Authenticated user context was not initialized",
      undefined,
      "AuthenticationContextError",
    );
  }

  return request.user.id;
}

export async function updateStatsController(
  request: FastifyRequest<{
    Params: CharacterIdParams;
    Body: ReplaceStatsInput;
  }>,
  reply: FastifyReply,
) {
  const service = new StatService(new StatRepository(request.server.prisma));
  const stats = await service.replace(
    getUserId(request),
    request.params.id,
    request.body.stats,
    request.log,
  );

  return reply.status(200).send({
    stats,
  });
}
