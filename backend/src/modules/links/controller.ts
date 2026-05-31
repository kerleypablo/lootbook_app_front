import type { FastifyReply, FastifyRequest } from "fastify";

export async function createLinkController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(501).send({
    message: "Link creation not implemented yet",
  });
}

export async function deleteLinkController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(501).send({
    message: "Link deletion not implemented yet",
  });
}

export async function recalculateCharacterController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(501).send({
    message: "Character recalculation not implemented yet",
  });
}
