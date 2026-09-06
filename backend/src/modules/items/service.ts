import type { FastifyBaseLogger } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { ItemRepository } from "./repository.js";
import type { CreateCharacterItemInput, UpdateCharacterItemInput } from "./types.js";

export class ItemService {
  constructor(private readonly repository: ItemRepository) {}

  async create(userId: string, characterId: string, input: CreateCharacterItemInput, logger: FastifyBaseLogger) {
    return this.run(userId, characterId, logger, "create", () => this.repository.createOwned(userId, characterId, input));
  }

  async list(userId: string, characterId: string, logger: FastifyBaseLogger) {
    return this.run(userId, characterId, logger, "list", () => this.repository.listOwned(userId, characterId));
  }

  async update(userId: string, characterId: string, itemId: string, input: UpdateCharacterItemInput, logger: FastifyBaseLogger) {
    return this.run(userId, characterId, logger, "update", () => this.repository.updateOwned(userId, characterId, itemId, input), itemId);
  }

  async delete(userId: string, characterId: string, itemId: string, logger: FastifyBaseLogger) {
    const deleted = await this.run(userId, characterId, logger, "delete", () => this.repository.deleteOwned(userId, characterId, itemId), itemId);
    if (!deleted) this.notFound(characterId, itemId);
  }

  private async run<T>(userId: string, characterId: string, logger: FastifyBaseLogger, operation: string, callback: () => Promise<T | null>, itemId?: string): Promise<T> {
    try {
      const result = await callback();
      if (result === null) this.notFound(characterId, itemId);
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, userId, characterId, itemId, operation }, "Failed to handle character item");
      throw error;
    }
  }

  private notFound(characterId: string, itemId?: string): never {
    throw new AppError(404, itemId ? "Item not found" : "Character not found", { characterId, ...(itemId ? { itemId } : {}) }, itemId ? "ItemNotFoundError" : "CharacterNotFoundError");
  }
}
