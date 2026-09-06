import type { FastifyBaseLogger } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { ActionRepository } from "./repository.js";
import type { CreateCharacterActionInput, UpdateCharacterActionInput } from "./types.js";

export class ActionService {
  constructor(private readonly repository: ActionRepository) {}

  async create(userId: string, characterId: string, input: CreateCharacterActionInput, logger: FastifyBaseLogger) {
    return this.run(userId, characterId, logger, "create", () => this.repository.createOwned(userId, characterId, input));
  }
  async list(userId: string, characterId: string, logger: FastifyBaseLogger) {
    return this.run(userId, characterId, logger, "list", () => this.repository.listOwned(userId, characterId));
  }
  async update(userId: string, characterId: string, actionId: string, input: UpdateCharacterActionInput, logger: FastifyBaseLogger) {
    return this.run(userId, characterId, logger, "update", () => this.repository.updateOwned(userId, characterId, actionId, input), actionId);
  }
  async delete(userId: string, characterId: string, actionId: string, logger: FastifyBaseLogger) {
    const deleted = await this.run(userId, characterId, logger, "delete", () => this.repository.deleteOwned(userId, characterId, actionId), actionId);
    if (!deleted) this.notFound(characterId, actionId);
  }

  private async run<T>(userId: string, characterId: string, logger: FastifyBaseLogger, operation: string, callback: () => Promise<T | null>, actionId?: string): Promise<T> {
    try {
      const result = await callback();
      if (result === null) this.notFound(characterId, actionId);
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, userId, characterId, actionId, operation }, "Failed to handle character action");
      throw error;
    }
  }

  private notFound(characterId: string, actionId?: string): never {
    throw new AppError(404, actionId ? "Action not found" : "Character not found", { characterId, ...(actionId ? { actionId } : {}) }, actionId ? "ActionNotFoundError" : "CharacterNotFoundError");
  }
}
