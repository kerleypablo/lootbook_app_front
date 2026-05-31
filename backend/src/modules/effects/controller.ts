import type { FastifyReply, FastifyRequest } from "fastify";

export async function createEffectController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(501).send({
    message: "Effect creation not implemented yet",
  });
}
