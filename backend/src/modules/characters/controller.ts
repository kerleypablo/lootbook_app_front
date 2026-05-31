import type { FastifyReply, FastifyRequest } from "fastify";

async function notImplemented(reply: FastifyReply, message: string) {
  return reply.status(501).send({ message });
}

export async function createCharacterController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return notImplemented(reply, "Character creation not implemented yet");
}

export async function listCharactersController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return notImplemented(reply, "Character listing not implemented yet");
}

export async function getCharacterController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return notImplemented(reply, "Character fetch not implemented yet");
}

export async function updateCharacterController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return notImplemented(reply, "Character update not implemented yet");
}

export async function deleteCharacterController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return notImplemented(reply, "Character deletion not implemented yet");
}
