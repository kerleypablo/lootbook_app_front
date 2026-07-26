import { Prisma, type PrismaClient } from "@prisma/client";
import type {
  CharacterStatInput,
  CharacterStatSummary,
} from "./types.js";

const statSelect = {
  id: true,
  key: true,
  label: true,
  baseValue: true,
  currentValue: true,
  maxValue: true,
  metaJson: true,
  createdAt: true,
  updatedAt: true,
} as const;

type PersistedStat = {
  id: string;
  key: string;
  label: string;
  baseValue: Prisma.Decimal | null;
  currentValue: Prisma.Decimal | null;
  maxValue: Prisma.Decimal | null;
  metaJson: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

function toJsonValue(value: Prisma.InputJsonValue | null) {
  return value === null ? Prisma.JsonNull : value;
}

function toStatSummary(stat: PersistedStat): CharacterStatSummary {
  return {
    ...stat,
    baseValue: stat.baseValue === null ? null : Number(stat.baseValue),
    currentValue: stat.currentValue === null ? null : Number(stat.currentValue),
    maxValue: stat.maxValue === null ? null : Number(stat.maxValue),
  };
}

export class StatRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async replaceOwned(
    userId: string,
    characterId: string,
    stats: CharacterStatInput[],
  ): Promise<CharacterStatSummary[] | null> {
    const persistedStats = await this.prisma.$transaction(async (transaction) => {
      const character = await transaction.character.findFirst({
        where: {
          id: characterId,
          userId,
        },
        select: { id: true },
      });

      if (!character) {
        return null;
      }

      await transaction.characterStat.deleteMany({
        where: { characterId },
      });

      if (stats.length > 0) {
        await transaction.characterStat.createMany({
          data: stats.map((stat) => ({
            characterId,
            key: stat.key,
            label: stat.label,
            baseValue: stat.baseValue,
            currentValue: stat.currentValue,
            maxValue: stat.maxValue,
            ...(stat.metaJson !== undefined
              ? { metaJson: toJsonValue(stat.metaJson) }
              : {}),
          })),
        });
      }

      return transaction.characterStat.findMany({
        where: { characterId },
        orderBy: { key: "asc" },
        select: statSelect,
      });
    });

    return persistedStats?.map(toStatSummary) ?? null;
  }
}
