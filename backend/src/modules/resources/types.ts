import type { Prisma } from "@prisma/client";

export type CharacterResourceInput = {
  key: string;
  label: string;
  currentValue?: number | null;
  maxValue?: number | null;
  resetRule?: string | null;
  metaJson?: Prisma.InputJsonValue | null;
};

export type ReplaceResourcesInput = {
  resources: CharacterResourceInput[];
};

export type CharacterResourceSummary = {
  id: string;
  key: string;
  label: string;
  currentValue: number | null;
  maxValue: number | null;
  resetRule: string | null;
  metaJson: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CharacterIdParams = {
  id: string;
};
