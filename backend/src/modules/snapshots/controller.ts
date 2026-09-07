import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { SnapshotRepository } from "./repository.js";
import { SnapshotService } from "./service.js";
import type { CharacterIdParams } from "./types.js";

export async function getCharacterSheetController(
  request: FastifyRequest<{ Params: CharacterIdParams }>,
  reply: FastifyReply,
) {
  if (!request.user) {
    throw new AppError(
      500,
      "Authenticated user context was not initialized",
      undefined,
      "AuthenticationContextError",
    );
  }

  const sheet = await new SnapshotService(
    new SnapshotRepository(request.server.prisma),
  ).getSheet(request.user.id, request.params.id, request.log);

  return reply.status(200).send({ sheet });
}
