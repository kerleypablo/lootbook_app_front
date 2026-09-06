import type { FastifyBaseLogger } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { EffectRepository } from "./repository.js";
import type { CreateCharacterEffectInput, UpdateCharacterEffectInput } from "./types.js";

export class EffectService {
  constructor(private readonly repository: EffectRepository) {}

  async create(userId: string, characterId: string, input: CreateCharacterEffectInput, logger: FastifyBaseLogger) {
    return this.run(userId, characterId, logger, "create", () => this.repository.createOwned(userId, characterId, input));
  }
  async list(userId: string, characterId: string, logger: FastifyBaseLogger) {
    return this.run(userId, characterId, logger, "list", () => this.repository.listOwned(userId, characterId));
  }
  async update(userId: string, characterId: string, effectId: string, input: UpdateCharacterEffectInput, logger: FastifyBaseLogger) {
    return this.run(userId, characterId, logger, "update", () => this.repository.updateOwned(userId, characterId, effectId, input), effectId);
  }
  async delete(userId: string, characterId: string, effectId: string, logger: FastifyBaseLogger) {
    const deleted = await this.run(userId, characterId, logger, "delete", () => this.repository.deleteOwned(userId, characterId, effectId), effectId);
    if (!deleted) this.notFound(characterId, effectId);
  }

  private async run<T>(userId: string, characterId: string, logger: FastifyBaseLogger, operation: string, callback: () => Promise<T | null>, effectId?: string): Promise<T> {
    try {
      const result = await callback();
      if (result === null) this.notFound(characterId, effectId);
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, userId, characterId, effectId, operation }, "Failed to handle character effect");
      throw error;
    }
  }

  private notFound(characterId: string, effectId?: string): never {
    throw new AppError(404, effectId ? "Effect not found" : "Character not found", { characterId, ...(effectId ? { effectId } : {}) }, effectId ? "EffectNotFoundError" : "CharacterNotFoundError");
  }
}
