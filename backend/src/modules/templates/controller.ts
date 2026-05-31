import type { FastifyReply, FastifyRequest } from "fastify";

export async function listTemplatesController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(501).send({
    message: "Template listing not implemented yet",
  });
}
