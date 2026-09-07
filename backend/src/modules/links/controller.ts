import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { LinkRepository } from "./repository.js";
import { LinkService } from "./service.js";
import { SnapshotRepository } from "../snapshots/repository.js";
import { SnapshotService } from "../snapshots/service.js";
import type { CharacterIdParams, CharacterLinkIdParams, CreateCharacterLinkInput } from "./types.js";

function service(request: FastifyRequest) {
  return new LinkService(
    new LinkRepository(request.server.prisma),
    new SnapshotService(new SnapshotRepository(request.server.prisma)),
  );
}

function userId(request: FastifyRequest) {
  if (!request.user) {
    throw new AppError(500, "Authenticated user context was not initialized", undefined, "AuthenticationContextError");
  }
  return request.user.id;
}

export async function createLinkController(
  request: FastifyRequest<{ Params: CharacterIdParams; Body: CreateCharacterLinkInput }>,
  reply: FastifyReply,
) {
  const link = await service(request).create(userId(request), request.params.id, request.body, request.log);
  return reply.status(201).send({ link });
}

export async function listLinksController(
  request: FastifyRequest<{ Params: CharacterIdParams }>,
  reply: FastifyReply,
) {
  const links = await service(request).list(userId(request), request.params.id, request.log);
  return reply.status(200).send({ links });
}

export async function deleteLinkController(
  request: FastifyRequest<{ Params: CharacterLinkIdParams }>,
  reply: FastifyReply,
) {
  await service(request).delete(userId(request), request.params.id, request.params.linkId, request.log);
  return reply.status(204).send();
}

export async function recalculateCharacterController(
  request: FastifyRequest<{ Params: CharacterIdParams }>,
  reply: FastifyReply,
) {
  const result = await service(request).recalculate(userId(request), request.params.id, request.log);
  return reply.status(200).send(result);
}
