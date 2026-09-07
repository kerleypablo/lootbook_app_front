import type { FastifyBaseLogger } from "fastify";
import type { Prisma } from "@prisma/client";
import { AppError } from "../../shared/errors/app-error.js";
import { invalidLinkError, recalculateCharacter, validateLinkDefinition } from "./calculator.js";
import { LinkRepository } from "./repository.js";
import type { CreateCharacterLinkInput } from "./types.js";
import { SnapshotService } from "../snapshots/service.js";

export class LinkService {
  constructor(
    private readonly repository: LinkRepository,
    private readonly snapshotService: SnapshotService,
  ) {}

  async create(
    userId: string,
    characterId: string,
    input: CreateCharacterLinkInput,
    logger: FastifyBaseLogger,
  ) {
    try {
      const calculationInput = await this.repository.getOwnedCalculationInput(userId, characterId);
      if (!calculationInput) this.characterNotFound(characterId);

      try {
        validateLinkDefinition(input, calculationInput);
      } catch (error) {
        throw invalidLinkError(characterId, error);
      }

      const link = await this.repository.createOwned(userId, characterId, input);
      if (!link) this.characterNotFound(characterId);
      return link;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, userId, characterId }, "Failed to create character link");
      throw error;
    }
  }

  async list(userId: string, characterId: string, logger: FastifyBaseLogger) {
    try {
      const links = await this.repository.listOwned(userId, characterId);
      if (!links) this.characterNotFound(characterId);
      return links;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, userId, characterId }, "Failed to list character links");
      throw error;
    }
  }

  async delete(userId: string, characterId: string, linkId: string, logger: FastifyBaseLogger) {
    try {
      const deleted = await this.repository.deleteOwned(userId, characterId, linkId);
      if (!deleted) {
        throw new AppError(404, "Link not found", { characterId, linkId }, "LinkNotFoundError");
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, userId, characterId, linkId }, "Failed to delete character link");
      throw error;
    }
  }

  async recalculate(userId: string, characterId: string, logger: FastifyBaseLogger) {
    try {
      const input = await this.repository.getOwnedCalculationInput(userId, characterId);
      if (!input) this.characterNotFound(characterId);
      const state = recalculateCharacter(input);
      const snapshot = await this.snapshotService.create(
        userId,
        characterId,
        state as unknown as Prisma.InputJsonValue,
        logger,
      );
      return { state, snapshot };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, userId, characterId }, "Failed to recalculate character");
      throw error;
    }
  }

  private characterNotFound(characterId: string): never {
    throw new AppError(404, "Character not found", { characterId }, "CharacterNotFoundError");
  }
}
