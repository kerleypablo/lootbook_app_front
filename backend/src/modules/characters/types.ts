import type { CharacterStatus, Prisma } from "@prisma/client";

export type CharacterTemplateReference = {
  id: string;
  key: string;
  name: string;
};

export type CharacterSummary = {
  id: string;
  templateId: string | null;
  name: string;
  level: number;
  status: CharacterStatus;
  portraitUrl: string | null;
  summaryJson: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  template: CharacterTemplateReference | null;
};

export type CreateCharacterInput = {
  name: string;
  templateId?: string | null;
  level?: number;
  status?: CharacterStatus;
  portraitUrl?: string | null;
  summaryJson?: Prisma.InputJsonValue | null;
};

export type UpdateCharacterInput = {
  name?: string;
  templateId?: string | null;
  level?: number;
  status?: CharacterStatus;
  portraitUrl?: string | null;
  summaryJson?: Prisma.InputJsonValue | null;
};

export type CharacterIdParams = {
  id: string;
};
