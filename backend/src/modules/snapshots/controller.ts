import type { FastifyReply, FastifyRequest } from "fastify";

export async function getCharacterSheetController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(501).send({
    message: "Character sheet endpoint not implemented yet",
  });
}
