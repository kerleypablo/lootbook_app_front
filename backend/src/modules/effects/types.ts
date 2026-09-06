import type { EffectType, Prisma } from "@prisma/client";

export type CreateCharacterEffectInput = {
  sourceType: string;
  sourceLabel: string;
  effectType: EffectType;
  payloadJson: Prisma.InputJsonValue;
  active?: boolean;
};

export type UpdateCharacterEffectInput = Partial<CreateCharacterEffectInput>;

export type CharacterEffectSummary = {
  id: string;
  sourceType: string;
  sourceLabel: string;
  effectType: EffectType;
  payloadJson: Prisma.JsonValue;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CharacterIdParams = { id: string };
export type CharacterEffectIdParams = CharacterIdParams & { effectId: string };
