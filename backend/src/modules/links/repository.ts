import { Prisma, type PrismaClient } from "@prisma/client";
import type {
  CharacterLinkSummary,
  CreateCharacterLinkInput,
  LinkSourceType,
  LinkTargetType,
  OwnedCharacterCalculationInput,
} from "./types.js";

const linkSelect = {
  id: true,
  sourceType: true,
  sourceId: true,
  targetType: true,
  targetId: true,
  operation: true,
  configJson: true,
  createdAt: true,
  updatedAt: true,
} as const;

type PersistedLink = {
  id: string;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  operation: CharacterLinkSummary["operation"];
  configJson: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

function toJsonValue(value: Prisma.InputJsonObject | null) {
  return value === null ? Prisma.JsonNull : value;
}

function toLinkSummary(link: PersistedLink): CharacterLinkSummary {
  return {
    id: link.id,
    source: { type: link.sourceType as LinkSourceType, id: link.sourceId },
    target: { type: link.targetType as LinkTargetType, id: link.targetId },
    operation: link.operation,
    configJson: link.configJson,
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
  };
}

function decimalToNumber(value: Prisma.Decimal | null) {
  return value === null ? null : Number(value);
}

export class LinkRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createOwned(userId: string, characterId: string, input: CreateCharacterLinkInput) {
    return this.prisma.$transaction(async (transaction) => {
      const character = await transaction.character.findFirst({
        where: { id: characterId, userId },
        select: { id: true },
      });
      if (!character) return null;

      const link = await transaction.characterLink.create({
        data: {
          characterId,
          sourceType: input.source.type,
          sourceId: input.source.id,
          targetType: input.target.type,
          targetId: input.target.id,
          operation: input.operation,
          ...(input.configJson !== undefined
            ? { configJson: toJsonValue(input.configJson) }
            : {}),
        },
        select: linkSelect,
      });
      return toLinkSummary(link);
    });
  }

  async listOwned(userId: string, characterId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const character = await transaction.character.findFirst({
        where: { id: characterId, userId },
        select: { id: true },
      });
      if (!character) return null;

      const links = await transaction.characterLink.findMany({
        where: { characterId },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: linkSelect,
      });
      return links.map(toLinkSummary);
    });
  }

  async deleteOwned(userId: string, characterId: string, linkId: string) {
    const result = await this.prisma.characterLink.deleteMany({
      where: { id: linkId, characterId, character: { userId } },
    });
    return result.count > 0;
  }

  async getOwnedCalculationInput(
    userId: string,
    characterId: string,
  ): Promise<OwnedCharacterCalculationInput | null> {
    const character = await this.prisma.character.findFirst({
      where: { id: characterId, userId },
      select: {
        id: true,
        stats: {
          orderBy: { key: "asc" },
          select: { key: true, baseValue: true, currentValue: true, maxValue: true },
        },
        resources: {
          orderBy: { key: "asc" },
          select: { key: true, currentValue: true, maxValue: true },
        },
        items: {
          orderBy: { id: "asc" },
          select: { id: true, equipped: true, quantity: true, weight: true },
        },
        actions: { orderBy: { id: "asc" }, select: { id: true } },
        effects: {
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          select: { id: true, active: true, payloadJson: true },
        },
        links: {
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          select: linkSelect,
        },
      },
    });

    if (!character) return null;

    return {
      characterId: character.id,
      stats: character.stats.map((stat) => ({
        key: stat.key,
        baseValue: decimalToNumber(stat.baseValue),
        currentValue: decimalToNumber(stat.currentValue),
        maxValue: decimalToNumber(stat.maxValue),
      })),
      resources: character.resources.map((resource) => ({
        key: resource.key,
        currentValue: decimalToNumber(resource.currentValue),
        maxValue: decimalToNumber(resource.maxValue),
      })),
      items: character.items.map((item) => ({
        ...item,
        weight: decimalToNumber(item.weight),
      })),
      actionIds: character.actions.map((action) => action.id),
      effects: character.effects,
      links: character.links.map(toLinkSummary),
    };
  }
}
