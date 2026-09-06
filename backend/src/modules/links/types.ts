import type { LinkOperation, Prisma } from "@prisma/client";

export type LinkSourceType = "STAT" | "RESOURCE" | "ITEM" | "ACTION" | "EFFECT" | "INVENTORY";
export type LinkTargetType = "STAT" | "RESOURCE" | "DERIVED";

export type LinkReference<TType extends string> = {
  type: TType;
  id: string;
};

export type CreateCharacterLinkInput = {
  source: LinkReference<LinkSourceType>;
  target: LinkReference<LinkTargetType>;
  operation: LinkOperation;
  configJson?: Prisma.InputJsonObject | null;
};

export type CharacterLinkSummary = {
  id: string;
  source: LinkReference<LinkSourceType>;
  target: LinkReference<LinkTargetType>;
  operation: LinkOperation;
  configJson: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CalculationStat = {
  key: string;
  baseValue: number | null;
  currentValue: number | null;
  maxValue: number | null;
};

export type CalculationResource = {
  key: string;
  currentValue: number | null;
  maxValue: number | null;
};

export type CalculationItem = {
  id: string;
  equipped: boolean;
  quantity: number;
  weight: number | null;
};

export type CalculationEffect = {
  id: string;
  active: boolean;
  payloadJson: Prisma.JsonValue;
};

export type OwnedCharacterCalculationInput = {
  characterId: string;
  stats: CalculationStat[];
  resources: CalculationResource[];
  items: CalculationItem[];
  actionIds: string[];
  effects: CalculationEffect[];
  links: CharacterLinkSummary[];
};

export type AppliedCalculation = {
  originType: "LINK" | "EFFECT";
  originId: string;
  operation: "ADD" | "SUBTRACT" | "SET_FROM_STAT" | "SUM_WEIGHTS" | "CONSUME_RESOURCE";
  target: LinkReference<LinkTargetType>;
  before: number;
  after: number;
};

export type CalculationWarning = {
  originType: "LINK" | "EFFECT";
  originId: string;
  code: string;
  message: string;
};

export type RecalculatedCharacterState = {
  version: 1;
  characterId: string;
  stats: Record<string, { baseValue: number | null; currentValue: number | null; maxValue: number | null }>;
  resources: Record<string, { currentValue: number | null; maxValue: number | null }>;
  derived: Record<string, number>;
  applied: AppliedCalculation[];
  warnings: CalculationWarning[];
};

export type CharacterIdParams = { id: string };
export type CharacterLinkIdParams = CharacterIdParams & { linkId: string };
