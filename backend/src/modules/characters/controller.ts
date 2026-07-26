import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { TemplateRepository } from "../templates/repository.js";
import { CharacterRepository } from "./repository.js";
import { CharacterService } from "./service.js";
import type {
  CharacterIdParams,
  CreateCharacterInput,
  UpdateCharacterInput,
} from "./types.js";

function createService(request: FastifyRequest) {
  return new CharacterService(
    new CharacterRepository(request.server.prisma),
    new TemplateRepository(request.server.prisma),
  );
}

function getUserId(request: FastifyRequest): string {
  if (!request.user) {
    request.log.error("Character route reached controller without request.user");
    throw new AppError(
      500,
      "Authenticated user context was not initialized",
      undefined,
      "AuthenticationContextError",
    );
  }

  return request.user.id;
}

export async function createCharacterController(
  request: FastifyRequest<{ Body: CreateCharacterInput }>,
  reply: FastifyReply,
) {
  const character = await createService(request).create(
    getUserId(request),
    request.body,
    request.log,
  );

  return reply.status(201).send({ character });
}

export async function listCharactersController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const characters = await createService(request).list(
    getUserId(request),
    request.log,
  );

  return reply.status(200).send({ characters });
}

export async function getCharacterController(
  request: FastifyRequest<{ Params: CharacterIdParams }>,
  reply: FastifyReply,
) {
  const character = await createService(request).get(
    getUserId(request),
    request.params.id,
    request.log,
  );

  return reply.status(200).send({ character });
}

export async function updateCharacterController(
  request: FastifyRequest<{
    Params: CharacterIdParams;
    Body: UpdateCharacterInput;
  }>,
  reply: FastifyReply,
) {
  const character = await createService(request).update(
    getUserId(request),
    request.params.id,
    request.body,
    request.log,
  );

  return reply.status(200).send({ character });
}

export async function deleteCharacterController(
  request: FastifyRequest<{ Params: CharacterIdParams }>,
  reply: FastifyReply,
) {
  await createService(request).delete(
    getUserId(request),
    request.params.id,
    request.log,
  );

  return reply.status(204).send();
}
