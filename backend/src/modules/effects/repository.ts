import type { PrismaClient } from "@prisma/client";
import type { CreateCharacterEffectInput, UpdateCharacterEffectInput } from "./types.js";

const effectSelect = {
  id: true, sourceType: true, sourceLabel: true, effectType: true,
  payloadJson: true, active: true, createdAt: true, updatedAt: true,
} as const;

export class EffectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createOwned(userId: string, characterId: string, input: CreateCharacterEffectInput) {
    return this.prisma.$transaction(async (transaction) => {
      const character = await transaction.character.findFirst({ where: { id: characterId, userId }, select: { id: true } });
      if (!character) return null;
      return transaction.characterEffect.create({ data: { ...input, characterId }, select: effectSelect });
    });
  }

  async listOwned(userId: string, characterId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const character = await transaction.character.findFirst({ where: { id: characterId, userId }, select: { id: true } });
      if (!character) return null;
      return transaction.characterEffect.findMany({ where: { characterId }, orderBy: [{ active: "desc" }, { createdAt: "asc" }], select: effectSelect });
    });
  }

  async updateOwned(userId: string, characterId: string, effectId: string, input: UpdateCharacterEffectInput) {
    return this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.characterEffect.findFirst({ where: { id: effectId, characterId, character: { userId } }, select: { id: true } });
      if (!existing) return null;
      return transaction.characterEffect.update({ where: { id: effectId }, data: input, select: effectSelect });
    });
  }

  async deleteOwned(userId: string, characterId: string, effectId: string) {
    const result = await this.prisma.characterEffect.deleteMany({ where: { id: effectId, characterId, character: { userId } } });
    return result.count > 0;
  }
}
