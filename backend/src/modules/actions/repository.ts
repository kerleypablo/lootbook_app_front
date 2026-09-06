import { Prisma, type PrismaClient } from "@prisma/client";
import type { CreateCharacterActionInput, UpdateCharacterActionInput } from "./types.js";

const actionSelect = {
  id: true, name: true, actionType: true, costJson: true, rollJson: true,
  damageJson: true, metaJson: true, createdAt: true, updatedAt: true,
} as const;

function toJsonValue(value: Prisma.InputJsonValue | null) {
  return value === null ? Prisma.JsonNull : value;
}

function jsonChanges(input: UpdateCharacterActionInput) {
  return {
    ...(input.costJson !== undefined ? { costJson: toJsonValue(input.costJson) } : {}),
    ...(input.rollJson !== undefined ? { rollJson: toJsonValue(input.rollJson) } : {}),
    ...(input.damageJson !== undefined ? { damageJson: toJsonValue(input.damageJson) } : {}),
    ...(input.metaJson !== undefined ? { metaJson: toJsonValue(input.metaJson) } : {}),
  };
}

export class ActionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createOwned(userId: string, characterId: string, input: CreateCharacterActionInput) {
    return this.prisma.$transaction(async (transaction) => {
      const character = await transaction.character.findFirst({ where: { id: characterId, userId }, select: { id: true } });
      if (!character) return null;
      const { costJson, rollJson, damageJson, metaJson, ...data } = input;
      return transaction.characterAction.create({
        data: {
          ...data,
          characterId,
          ...(costJson !== undefined ? { costJson: toJsonValue(costJson) } : {}),
          ...(rollJson !== undefined ? { rollJson: toJsonValue(rollJson) } : {}),
          ...(damageJson !== undefined ? { damageJson: toJsonValue(damageJson) } : {}),
          ...(metaJson !== undefined ? { metaJson: toJsonValue(metaJson) } : {}),
        },
        select: actionSelect,
      });
    });
  }

  async listOwned(userId: string, characterId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const character = await transaction.character.findFirst({ where: { id: characterId, userId }, select: { id: true } });
      if (!character) return null;
      return transaction.characterAction.findMany({ where: { characterId }, orderBy: { name: "asc" }, select: actionSelect });
    });
  }

  async updateOwned(userId: string, characterId: string, actionId: string, input: UpdateCharacterActionInput) {
    return this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.characterAction.findFirst({ where: { id: actionId, characterId, character: { userId } }, select: { id: true } });
      if (!existing) return null;
      const scalarChanges = {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.actionType !== undefined ? { actionType: input.actionType } : {}),
      };
      return transaction.characterAction.update({ where: { id: actionId }, data: { ...scalarChanges, ...jsonChanges(input) }, select: actionSelect });
    });
  }

  async deleteOwned(userId: string, characterId: string, actionId: string) {
    const result = await this.prisma.characterAction.deleteMany({ where: { id: actionId, characterId, character: { userId } } });
    return result.count > 0;
  }
}
