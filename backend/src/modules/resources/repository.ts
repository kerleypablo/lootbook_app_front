import { Prisma, type PrismaClient } from "@prisma/client";
import type {
  CharacterResourceInput,
  CharacterResourceSummary,
} from "./types.js";

const resourceSelect = {
  id: true,
  key: true,
  label: true,
  currentValue: true,
  maxValue: true,
  resetRule: true,
  metaJson: true,
  createdAt: true,
  updatedAt: true,
} as const;

type PersistedResource = {
  id: string;
  key: string;
  label: string;
  currentValue: Prisma.Decimal | null;
  maxValue: Prisma.Decimal | null;
  resetRule: string | null;
  metaJson: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

function toJsonValue(value: Prisma.InputJsonValue | null) {
  return value === null ? Prisma.JsonNull : value;
}

function toResourceSummary(
  resource: PersistedResource,
): CharacterResourceSummary {
  return {
    ...resource,
    currentValue:
      resource.currentValue === null ? null : Number(resource.currentValue),
    maxValue: resource.maxValue === null ? null : Number(resource.maxValue),
  };
}

export class ResourceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async replaceOwned(
    userId: string,
    characterId: string,
    resources: CharacterResourceInput[],
  ): Promise<CharacterResourceSummary[] | null> {
    const persistedResources = await this.prisma.$transaction(
      async (transaction) => {
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

        await transaction.characterResource.deleteMany({
          where: { characterId },
        });

        if (resources.length > 0) {
          await transaction.characterResource.createMany({
            data: resources.map((resource) => ({
              characterId,
              key: resource.key,
              label: resource.label,
              currentValue: resource.currentValue,
              maxValue: resource.maxValue,
              resetRule: resource.resetRule,
              ...(resource.metaJson !== undefined
                ? { metaJson: toJsonValue(resource.metaJson) }
                : {}),
            })),
          });
        }

        return transaction.characterResource.findMany({
          where: { characterId },
          orderBy: { key: "asc" },
          select: resourceSelect,
        });
      },
    );

    return persistedResources?.map(toResourceSummary) ?? null;
  }
}
