import type { FastifyBaseLogger } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { TemplateRepository } from "../templates/repository.js";
import { TemplateService } from "../templates/service.js";
import { CharacterRepository } from "./repository.js";
import type {
  CharacterSummary,
  CreateCharacterInput,
  UpdateCharacterInput,
} from "./types.js";

export class CharacterService {
  private readonly templateService: TemplateService;

  constructor(private readonly repository: CharacterRepository, templateRepository: TemplateRepository) {
    this.templateService = new TemplateService(templateRepository);
  }

  async create(
    userId: string,
    input: CreateCharacterInput,
    logger: FastifyBaseLogger,
  ): Promise<CharacterSummary> {
    try {
      const templateId = await this.resolveTemplateId(input.templateId, logger);
      return await this.repository.create(userId, { ...input, templateId });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error({ err: error, userId, name: input.name }, "Failed to create character");
      throw error;
    }
  }

  async list(userId: string, logger: FastifyBaseLogger): Promise<CharacterSummary[]> {
    try {
      return await this.repository.listByUser(userId);
    } catch (error) {
      logger.error({ err: error, userId }, "Failed to list characters");
      throw error;
    }
  }

  async get(
    userId: string,
    characterId: string,
    logger: FastifyBaseLogger,
  ): Promise<CharacterSummary> {
    try {
      const character = await this.repository.findOwnedById(userId, characterId);
      return this.ensureCharacter(character, userId, characterId, logger);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error({ err: error, userId, characterId }, "Failed to fetch character");
      throw error;
    }
  }

  async update(
    userId: string,
    characterId: string,
    input: UpdateCharacterInput,
    logger: FastifyBaseLogger,
  ): Promise<CharacterSummary> {
    try {
      const { templateId: requestedTemplateId, ...changes } = input;
      const templateId =
        requestedTemplateId === undefined
          ? undefined
          : await this.resolveTemplateId(requestedTemplateId, logger);
      const character = await this.repository.updateOwned(userId, characterId, {
        ...changes,
        ...(templateId !== undefined ? { templateId } : {}),
      });

      return this.ensureCharacter(character, userId, characterId, logger);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error({ err: error, userId, characterId }, "Failed to update character");
      throw error;
    }
  }

  async delete(
    userId: string,
    characterId: string,
    logger: FastifyBaseLogger,
  ): Promise<void> {
    try {
      const deleted = await this.repository.deleteOwned(userId, characterId);

      if (!deleted) {
        this.throwCharacterNotFound(userId, characterId, logger);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error({ err: error, userId, characterId }, "Failed to delete character");
      throw error;
    }
  }

  private async resolveTemplateId(
    templateId: string | null | undefined,
    logger: FastifyBaseLogger,
  ): Promise<string> {
    if (templateId) {
      return (await this.templateService.getTemplateById(templateId, logger)).id;
    }

    return (await this.templateService.getDefaultTemplate(logger)).id;
  }

  private ensureCharacter(
    character: CharacterSummary | null,
    userId: string,
    characterId: string,
    logger: FastifyBaseLogger,
  ): CharacterSummary {
    if (!character) {
      this.throwCharacterNotFound(userId, characterId, logger);
    }

    return character;
  }

  private throwCharacterNotFound(
    userId: string,
    characterId: string,
    logger: FastifyBaseLogger,
  ): never {
    logger.warn({ userId, characterId }, "Character was not found or is not owned by user");
    throw new AppError(
      404,
      "Character not found",
      { characterId },
      "CharacterNotFoundError",
    );
  }
}
