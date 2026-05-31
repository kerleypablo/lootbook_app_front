import type { FastifyReply, FastifyRequest } from "fastify";

export async function createItemController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(501).send({
    message: "Item creation not implemented yet",
  });
}

export async function updateItemController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(501).send({
    message: "Item update not implemented yet",
  });
}
