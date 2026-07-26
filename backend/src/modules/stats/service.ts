import type { FastifyBaseLogger } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { StatRepository } from "./repository.js";
import type {
  CharacterStatInput,
  CharacterStatSummary,
} from "./types.js";

export class StatService {
  constructor(private readonly repository: StatRepository) {}

  async replace(
    userId: string,
    characterId: string,
    stats: CharacterStatInput[],
    logger: FastifyBaseLogger,
  ): Promise<CharacterStatSummary[]> {
    this.ensureUniqueKeys(stats, characterId, logger);

    try {
      const savedStats = await this.repository.replaceOwned(
        userId,
        characterId,
        stats,
      );

      if (!savedStats) {
        logger.warn(
          { userId, characterId },
          "Character was not found or is not owned by user during stat update",
        );
        throw new AppError(
          404,
          "Character not found",
          { characterId },
          "CharacterNotFoundError",
        );
      }

      return savedStats;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error(
        { err: error, userId, characterId, statCount: stats.length },
        "Failed to replace character stats",
      );
      throw error;
    }
  }

  private ensureUniqueKeys(
    stats: CharacterStatInput[],
    characterId: string,
    logger: FastifyBaseLogger,
  ) {
    const keys = new Set<string>();
    const duplicatedKeys = new Set<string>();

    for (const stat of stats) {
      if (keys.has(stat.key)) {
        duplicatedKeys.add(stat.key);
      }
      keys.add(stat.key);
    }

    if (duplicatedKeys.size > 0) {
      const duplicated = [...duplicatedKeys];
      logger.warn(
        { characterId, duplicatedKeys: duplicated },
        "Duplicate stat keys received",
      );
      throw new AppError(
        400,
        "Stat keys must be unique for a character",
        { duplicatedKeys: duplicated },
        "DuplicateStatKeyError",
      );
    }
  }
}
