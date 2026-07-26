import type { Prisma } from "@prisma/client";

export type CharacterStatInput = {
  key: string;
  label: string;
  baseValue?: number | null;
  currentValue?: number | null;
  maxValue?: number | null;
  metaJson?: Prisma.InputJsonValue | null;
};

export type ReplaceStatsInput = {
  stats: CharacterStatInput[];
};

export type CharacterStatSummary = {
  id: string;
  key: string;
  label: string;
  baseValue: number | null;
  currentValue: number | null;
  maxValue: number | null;
  metaJson: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CharacterIdParams = {
  id: string;
};
