import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { ActionRepository } from "./repository.js";
import { ActionService } from "./service.js";
import type { CharacterActionIdParams, CharacterIdParams, CreateCharacterActionInput, UpdateCharacterActionInput } from "./types.js";

function service(request: FastifyRequest) { return new ActionService(new ActionRepository(request.server.prisma)); }
function userId(request: FastifyRequest) {
  if (!request.user) throw new AppError(500, "Authenticated user context was not initialized", undefined, "AuthenticationContextError");
  return request.user.id;
}

export async function createActionController(request: FastifyRequest<{ Params: CharacterIdParams; Body: CreateCharacterActionInput }>, reply: FastifyReply) {
  const action = await service(request).create(userId(request), request.params.id, request.body, request.log);
  return reply.status(201).send({ action });
}
export async function listActionsController(request: FastifyRequest<{ Params: CharacterIdParams }>, reply: FastifyReply) {
  const actions = await service(request).list(userId(request), request.params.id, request.log);
  return reply.status(200).send({ actions });
}
export async function updateActionController(request: FastifyRequest<{ Params: CharacterActionIdParams; Body: UpdateCharacterActionInput }>, reply: FastifyReply) {
  const action = await service(request).update(userId(request), request.params.id, request.params.actionId, request.body, request.log);
  return reply.status(200).send({ action });
}
export async function deleteActionController(request: FastifyRequest<{ Params: CharacterActionIdParams }>, reply: FastifyReply) {
  await service(request).delete(userId(request), request.params.id, request.params.actionId, request.log);
  return reply.status(204).send();
}
