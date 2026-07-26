import type { FastifyBaseLogger } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { TemplateRepository } from "./repository.js";
import { DEFAULT_TEMPLATE_KEY, type TemplateSummary } from "./types.js";

export class TemplateService {
  constructor(private readonly repository: TemplateRepository) {}

  async listTemplates(logger: FastifyBaseLogger): Promise<TemplateSummary[]> {
    try {
      return await this.repository.list();
    } catch (error) {
      logger.error({ err: error }, "Failed to list character templates");
      throw error;
    }
  }

  async getDefaultTemplate(
    logger: FastifyBaseLogger,
  ): Promise<TemplateSummary> {
    try {
      const template = await this.repository.findByKey(DEFAULT_TEMPLATE_KEY);

      if (!template) {
        logger.error(
          { templateKey: DEFAULT_TEMPLATE_KEY },
          "Default character template is missing",
        );
        throw new AppError(
          500,
          "Default character template is not configured",
          { templateKey: DEFAULT_TEMPLATE_KEY },
          "DefaultTemplateError",
        );
      }

      return template;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error(
        { err: error, templateKey: DEFAULT_TEMPLATE_KEY },
        "Failed to resolve default character template",
      );
      throw error;
    }
  }

  async getTemplateById(
    id: string,
    logger: FastifyBaseLogger,
  ): Promise<TemplateSummary> {
    try {
      const template = await this.repository.findById(id);

      if (!template) {
        throw new AppError(
          404,
          "Character template not found",
          { templateId: id },
          "TemplateNotFoundError",
        );
      }

      return template;
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn({ templateId: id }, "Character template was not found");
        throw error;
      }

      logger.error({ err: error, templateId: id }, "Failed to fetch character template");
      throw error;
    }
  }
}
