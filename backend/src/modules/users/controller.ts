import type { FastifyReply, FastifyRequest } from "fastify";

export async function getMeController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(501).send({
    message: "User profile endpoint not implemented yet",
  });
}
