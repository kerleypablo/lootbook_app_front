import type { FastifyReply, FastifyRequest } from "fastify";

export async function createActionController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(501).send({
    message: "Action creation not implemented yet",
  });
}

export async function updateActionController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(501).send({
    message: "Action update not implemented yet",
  });
}
