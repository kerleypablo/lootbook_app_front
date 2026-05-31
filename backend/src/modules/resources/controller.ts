import type { FastifyReply, FastifyRequest } from "fastify";

export async function updateResourcesController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(501).send({
    message: "Resource update not implemented yet",
  });
}
