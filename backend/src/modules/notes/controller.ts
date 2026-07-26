import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { NoteRepository } from "./repository.js";
import { NoteService } from "./service.js";
import type { CharacterIdParams, ReplaceNotesInput } from "./types.js";

function getUserId(request: FastifyRequest): string {
  if (!request.user) {
    request.log.error("Note route reached controller without request.user");
    throw new AppError(
      500,
      "Authenticated user context was not initialized",
      undefined,
      "AuthenticationContextError",
    );
  }

  return request.user.id;
}

export async function upsertNotesController(
  request: FastifyRequest<{
    Params: CharacterIdParams;
    Body: ReplaceNotesInput;
  }>,
  reply: FastifyReply,
) {
  const service = new NoteService(new NoteRepository(request.server.prisma));
  const notes = await service.replace(
    getUserId(request),
    request.params.id,
    request.body.notes,
    request.log,
  );

  return reply.status(200).send({
    notes,
  });
}
