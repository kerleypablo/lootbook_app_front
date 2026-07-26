import type { FastifyReply, FastifyRequest } from "fastify";
import { TemplateRepository } from "./repository.js";
import { TemplateService } from "./service.js";

export async function listTemplatesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const service = new TemplateService(new TemplateRepository(request.server.prisma));
  const templates = await service.listTemplates(request.log);

  return reply.status(200).send({
    templates,
  });
}
