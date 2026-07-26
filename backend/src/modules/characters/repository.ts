import { Prisma, type PrismaClient } from "@prisma/client";
import type {
  CharacterSummary,
  CreateCharacterInput,
  UpdateCharacterInput,
} from "./types.js";

const characterSelect = {
  id: true,
  templateId: true,
  name: true,
  level: true,
  status: true,
  portraitUrl: true,
  summaryJson: true,
  createdAt: true,
  updatedAt: true,
  template: {
    select: {
      id: true,
      key: true,
      name: true,
    },
  },
} as const;

function toJsonValue(value: Prisma.InputJsonValue | null) {
  return value === null ? Prisma.JsonNull : value;
}

export class CharacterRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    userId: string,
    input: CreateCharacterInput,
  ): Promise<CharacterSummary> {
    const { summaryJson, ...data } = input;

    return this.prisma.character.create({
      data: {
        ...data,
        userId,
        ...(summaryJson !== undefined
          ? { summaryJson: toJsonValue(summaryJson) }
          : {}),
      },
      select: characterSelect,
    });
  }

  async listByUser(userId: string): Promise<CharacterSummary[]> {
    return this.prisma.character.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: characterSelect,
    });
  }

  async findOwnedById(
    userId: string,
    characterId: string,
  ): Promise<CharacterSummary | null> {
    return this.prisma.character.findFirst({
      where: {
        id: characterId,
        userId,
      },
      select: characterSelect,
    });
  }

  async updateOwned(
    userId: string,
    characterId: string,
    input: UpdateCharacterInput,
  ): Promise<CharacterSummary | null> {
    const { summaryJson, ...data } = input;
    const result = await this.prisma.character.updateMany({
      where: {
        id: characterId,
        userId,
      },
      data: {
        ...data,
        ...(summaryJson !== undefined
          ? { summaryJson: toJsonValue(summaryJson) }
          : {}),
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.findOwnedById(userId, characterId);
  }

  async deleteOwned(userId: string, characterId: string): Promise<boolean> {
    const result = await this.prisma.character.deleteMany({
      where: {
        id: characterId,
        userId,
      },
    });

    return result.count > 0;
  }
}
