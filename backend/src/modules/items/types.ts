import type { ItemType, Prisma } from "@prisma/client";

export type CreateCharacterItemInput = {
  name: string;
  type: ItemType;
  equipped?: boolean;
  quantity?: number;
  weight?: number | null;
  metaJson?: Prisma.InputJsonValue | null;
};

export type UpdateCharacterItemInput = Partial<CreateCharacterItemInput>;

export type CharacterItemSummary = {
  id: string;
  name: string;
  type: ItemType;
  equipped: boolean;
  quantity: number;
  weight: number | null;
  metaJson: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CharacterIdParams = { id: string };
export type CharacterItemIdParams = CharacterIdParams & { itemId: string };
