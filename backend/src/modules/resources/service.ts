import type { FastifyBaseLogger } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { ResourceRepository } from "./repository.js";
import type {
  CharacterResourceInput,
  CharacterResourceSummary,
} from "./types.js";

export class ResourceService {
  constructor(private readonly repository: ResourceRepository) {}

  async replace(
    userId: string,
    characterId: string,
    resources: CharacterResourceInput[],
    logger: FastifyBaseLogger,
  ): Promise<CharacterResourceSummary[]> {
    this.validateResources(resources, characterId, logger);

    try {
      const savedResources = await this.repository.replaceOwned(
        userId,
        characterId,
        resources,
      );

      if (!savedResources) {
        logger.warn(
          { userId, characterId },
          "Character was not found or is not owned by user during resource update",
        );
        throw new AppError(
          404,
          "Character not found",
          { characterId },
          "CharacterNotFoundError",
        );
      }

      return savedResources;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error(
        { err: error, userId, characterId, resourceCount: resources.length },
        "Failed to replace character resources",
      );
      throw error;
    }
  }

  private validateResources(
    resources: CharacterResourceInput[],
    characterId: string,
    logger: FastifyBaseLogger,
  ) {
    const keys = new Set<string>();
    const duplicatedKeys = new Set<string>();

    for (const resource of resources) {
      if (keys.has(resource.key)) {
        duplicatedKeys.add(resource.key);
      }
      keys.add(resource.key);
    }

    if (duplicatedKeys.size > 0) {
      const duplicated = [...duplicatedKeys];
      logger.warn(
        { characterId, duplicatedKeys: duplicated },
        "Duplicate resource keys received",
      );
      throw new AppError(
        400,
        "Resource keys must be unique for a character",
        { duplicatedKeys: duplicated },
        "DuplicateResourceKeyError",
      );
    }
  }
}
