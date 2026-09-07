import type {
  ActionType,
  CharacterStatus,
  EffectType,
  ItemType,
  LinkOperation,
  Prisma,
} from "@prisma/client";
import type { RecalculatedCharacterState } from "../links/types.js";

export type CharacterIdParams = { id: string };

export type CharacterSnapshotSummary = {
  id: string;
  version: number;
  derivedStateJson: Prisma.JsonValue;
  createdAt: Date;
};

export type CharacterSheet = {
  character: {
    id: string;
    templateId: string | null;
    name: string;
    level: number;
    status: CharacterStatus;
    portraitUrl: string | null;
    summaryJson: Prisma.JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
    template: { id: string; key: string; name: string } | null;
  };
  stats: Array<{ id: string; key: string; label: string; baseValue: number | null; currentValue: number | null; maxValue: number | null; metaJson: Prisma.JsonValue | null; createdAt: Date; updatedAt: Date }>;
  resources: Array<{ id: string; key: string; label: string; currentValue: number | null; maxValue: number | null; resetRule: string | null; metaJson: Prisma.JsonValue | null; createdAt: Date; updatedAt: Date }>;
  items: Array<{ id: string; name: string; type: ItemType; equipped: boolean; quantity: number; weight: number | null; metaJson: Prisma.JsonValue | null; createdAt: Date; updatedAt: Date }>;
  actions: Array<{ id: string; name: string; actionType: ActionType; costJson: Prisma.JsonValue | null; rollJson: Prisma.JsonValue | null; damageJson: Prisma.JsonValue | null; metaJson: Prisma.JsonValue | null; createdAt: Date; updatedAt: Date }>;
  effects: Array<{ id: string; sourceType: string; sourceLabel: string; effectType: EffectType; payloadJson: Prisma.JsonValue; active: boolean; createdAt: Date; updatedAt: Date }>;
  links: Array<{ id: string; source: { type: "STAT" | "RESOURCE" | "ITEM" | "ACTION" | "EFFECT" | "INVENTORY"; id: string }; target: { type: "STAT" | "RESOURCE" | "DERIVED"; id: string }; operation: LinkOperation; configJson: Prisma.JsonValue | null; createdAt: Date; updatedAt: Date }>;
  notes: Array<{ id: string; section: string; content: string; createdAt: Date; updatedAt: Date }>;
  derivedState: RecalculatedCharacterState;
  latestSnapshot: CharacterSnapshotSummary | null;
};
