import { Prisma, type PrismaClient } from "@prisma/client";
import type {
  CharacterItemSummary,
  CreateCharacterItemInput,
  UpdateCharacterItemInput,
} from "./types.js";

const itemSelect = {
  id: true, name: true, type: true, equipped: true, quantity: true,
  weight: true, metaJson: true, createdAt: true, updatedAt: true,
} as const;

type PersistedItem = Omit<CharacterItemSummary, "weight"> & { weight: Prisma.Decimal | null };

function toJsonValue(value: Prisma.InputJsonValue | null) {
  return value === null ? Prisma.JsonNull : value;
}

function toSummary(item: PersistedItem): CharacterItemSummary {
  return { ...item, weight: item.weight === null ? null : Number(item.weight) };
}

export class ItemRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createOwned(userId: string, characterId: string, input: CreateCharacterItemInput) {
    return this.prisma.$transaction(async (transaction) => {
      const character = await transaction.character.findFirst({ where: { id: characterId, userId }, select: { id: true } });
      if (!character) return null;
      const { metaJson, ...data } = input;
      const item = await transaction.characterItem.create({
        data: { ...data, characterId, ...(metaJson !== undefined ? { metaJson: toJsonValue(metaJson) } : {}) },
        select: itemSelect,
      });
      return toSummary(item);
    });
  }

  async listOwned(userId: string, characterId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const character = await transaction.character.findFirst({ where: { id: characterId, userId }, select: { id: true } });
      if (!character) return null;
      const items = await transaction.characterItem.findMany({ where: { characterId }, orderBy: [{ equipped: "desc" }, { name: "asc" }], select: itemSelect });
      return items.map(toSummary);
    });
  }

  async updateOwned(userId: string, characterId: string, itemId: string, input: UpdateCharacterItemInput) {
    return this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.characterItem.findFirst({ where: { id: itemId, characterId, character: { userId } }, select: { id: true } });
      if (!existing) return null;
      const { metaJson, ...data } = input;
      const item = await transaction.characterItem.update({
        where: { id: itemId },
        data: { ...data, ...(metaJson !== undefined ? { metaJson: toJsonValue(metaJson) } : {}) },
        select: itemSelect,
      });
      return toSummary(item);
    });
  }

  async deleteOwned(userId: string, characterId: string, itemId: string) {
    const result = await this.prisma.characterItem.deleteMany({ where: { id: itemId, characterId, character: { userId } } });
    return result.count > 0;
  }
}
