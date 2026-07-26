import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { ResourceRepository } from "./repository.js";
import { ResourceService } from "./service.js";
import type { CharacterIdParams, ReplaceResourcesInput } from "./types.js";

function getUserId(request: FastifyRequest): string {
  if (!request.user) {
    request.log.error("Resource route reached controller without request.user");
    throw new AppError(
      500,
      "Authenticated user context was not initialized",
      undefined,
      "AuthenticationContextError",
    );
  }

  return request.user.id;
}

export async function updateResourcesController(
  request: FastifyRequest<{
    Params: CharacterIdParams;
    Body: ReplaceResourcesInput;
  }>,
  reply: FastifyReply,
) {
  const service = new ResourceService(
    new ResourceRepository(request.server.prisma),
  );
  const resources = await service.replace(
    getUserId(request),
    request.params.id,
    request.body.resources,
    request.log,
  );

  return reply.status(200).send({
    resources,
  });
}
