import type { FastifyReply, FastifyRequest } from "fastify";

export async function validateSessionController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(501).send({
    message: "Auth validation not implemented yet",
  });
}
