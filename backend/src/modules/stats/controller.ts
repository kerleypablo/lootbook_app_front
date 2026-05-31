import type { FastifyReply, FastifyRequest } from "fastify";

export async function updateStatsController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(501).send({
    message: "Stat update not implemented yet",
  });
}
