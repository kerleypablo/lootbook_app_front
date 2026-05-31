import type { FastifyReply, FastifyRequest } from "fastify";

export async function upsertNotesController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(501).send({
    message: "Character notes endpoint not implemented yet",
  });
}
