import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { ItemRepository } from "./repository.js";
import { ItemService } from "./service.js";
import type { CharacterIdParams, CharacterItemIdParams, CreateCharacterItemInput, UpdateCharacterItemInput } from "./types.js";

function service(request: FastifyRequest) { return new ItemService(new ItemRepository(request.server.prisma)); }
function userId(request: FastifyRequest) {
  if (!request.user) throw new AppError(500, "Authenticated user context was not initialized", undefined, "AuthenticationContextError");
  return request.user.id;
}

export async function createItemController(request: FastifyRequest<{ Params: CharacterIdParams; Body: CreateCharacterItemInput }>, reply: FastifyReply) {
  const item = await service(request).create(userId(request), request.params.id, request.body, request.log);
  return reply.status(201).send({ item });
}

export async function listItemsController(request: FastifyRequest<{ Params: CharacterIdParams }>, reply: FastifyReply) {
  const items = await service(request).list(userId(request), request.params.id, request.log);
  return reply.status(200).send({ items });
}

export async function updateItemController(request: FastifyRequest<{ Params: CharacterItemIdParams; Body: UpdateCharacterItemInput }>, reply: FastifyReply) {
  const item = await service(request).update(userId(request), request.params.id, request.params.itemId, request.body, request.log);
  return reply.status(200).send({ item });
}

export async function deleteItemController(request: FastifyRequest<{ Params: CharacterItemIdParams }>, reply: FastifyReply) {
  await service(request).delete(userId(request), request.params.id, request.params.itemId, request.log);
  return reply.status(204).send();
}
