import type { ActionType, Prisma } from "@prisma/client";

export type CreateCharacterActionInput = {
  name: string;
  actionType: ActionType;
  costJson?: Prisma.InputJsonValue | null;
  rollJson?: Prisma.InputJsonValue | null;
  damageJson?: Prisma.InputJsonValue | null;
  metaJson?: Prisma.InputJsonValue | null;
};

export type UpdateCharacterActionInput = Partial<CreateCharacterActionInput>;

export type CharacterActionSummary = {
  id: string;
  name: string;
  actionType: ActionType;
  costJson: Prisma.JsonValue | null;
  rollJson: Prisma.JsonValue | null;
  damageJson: Prisma.JsonValue | null;
  metaJson: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CharacterIdParams = { id: string };
export type CharacterActionIdParams = CharacterIdParams & { actionId: string };
