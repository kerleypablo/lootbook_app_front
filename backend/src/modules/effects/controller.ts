import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { EffectRepository } from "./repository.js";
import { EffectService } from "./service.js";
import type { CharacterEffectIdParams, CharacterIdParams, CreateCharacterEffectInput, UpdateCharacterEffectInput } from "./types.js";

function service(request: FastifyRequest) { return new EffectService(new EffectRepository(request.server.prisma)); }
function userId(request: FastifyRequest) {
  if (!request.user) throw new AppError(500, "Authenticated user context was not initialized", undefined, "AuthenticationContextError");
  return request.user.id;
}

export async function createEffectController(request: FastifyRequest<{ Params: CharacterIdParams; Body: CreateCharacterEffectInput }>, reply: FastifyReply) {
  const effect = await service(request).create(userId(request), request.params.id, request.body, request.log);
  return reply.status(201).send({ effect });
}
export async function listEffectsController(request: FastifyRequest<{ Params: CharacterIdParams }>, reply: FastifyReply) {
  const effects = await service(request).list(userId(request), request.params.id, request.log);
  return reply.status(200).send({ effects });
}
export async function updateEffectController(request: FastifyRequest<{ Params: CharacterEffectIdParams; Body: UpdateCharacterEffectInput }>, reply: FastifyReply) {
  const effect = await service(request).update(userId(request), request.params.id, request.params.effectId, request.body, request.log);
  return reply.status(200).send({ effect });
}
export async function deleteEffectController(request: FastifyRequest<{ Params: CharacterEffectIdParams }>, reply: FastifyReply) {
  await service(request).delete(userId(request), request.params.id, request.params.effectId, request.log);
  return reply.status(204).send();
}
