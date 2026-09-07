import type { FastifyBaseLogger } from "fastify";
import type { Prisma } from "@prisma/client";
import { AppError } from "../../shared/errors/app-error.js";
import { recalculateCharacter } from "../links/calculator.js";
import { SnapshotRepository } from "./repository.js";
import type { CharacterSheet, CharacterSnapshotSummary } from "./types.js";

export class SnapshotService {
  constructor(private readonly repository: SnapshotRepository) {}

  async create(
    userId: string,
    characterId: string,
    state: Prisma.InputJsonValue,
    logger: FastifyBaseLogger,
  ): Promise<CharacterSnapshotSummary> {
    try {
      const snapshot = await this.repository.createOwned(userId, characterId, state);
      if (!snapshot) this.characterNotFound(characterId);
      return snapshot;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, userId, characterId }, "Failed to persist character snapshot");
      throw error;
    }
  }

  async getSheet(
    userId: string,
    characterId: string,
    logger: FastifyBaseLogger,
  ): Promise<CharacterSheet> {
    try {
      const data = await this.repository.getOwnedSheetData(userId, characterId);
      if (!data) this.characterNotFound(characterId);
      const { calculationInput, ...sheet } = data;
      return { ...sheet, derivedState: recalculateCharacter(calculationInput) };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, userId, characterId }, "Failed to aggregate character sheet");
      throw error;
    }
  }

  private characterNotFound(characterId: string): never {
    throw new AppError(404, "Character not found", { characterId }, "CharacterNotFoundError");
  }
}
