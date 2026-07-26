import type { PrismaClient } from "@prisma/client";
import type { TemplateSummary } from "./types.js";

const templateSelect = {
  id: true,
  key: true,
  name: true,
  description: true,
  systemFamily: true,
  isOfficial: true,
  configJson: true,
} as const;

export class TemplateRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(): Promise<TemplateSummary[]> {
    return this.prisma.characterTemplate.findMany({
      orderBy: [{ isOfficial: "desc" }, { name: "asc" }],
      select: templateSelect,
    });
  }

  async findByKey(key: string): Promise<TemplateSummary | null> {
    return this.prisma.characterTemplate.findUnique({
      where: { key },
      select: templateSelect,
    });
  }

  async findById(id: string): Promise<TemplateSummary | null> {
    return this.prisma.characterTemplate.findUnique({
      where: { id },
      select: templateSelect,
    });
  }
}
