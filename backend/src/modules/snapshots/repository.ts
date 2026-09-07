import { Prisma, type PrismaClient } from "@prisma/client";
import type { CharacterLinkSummary, OwnedCharacterCalculationInput } from "../links/types.js";
import type { CharacterSheet, CharacterSnapshotSummary } from "./types.js";

function asNumber(value: Prisma.Decimal | null) {
  return value === null ? null : Number(value);
}

function toSnapshotSummary(snapshot: {
  id: string;
  version: number;
  derivedStateJson: Prisma.JsonValue;
  createdAt: Date;
}): CharacterSnapshotSummary {
  return snapshot;
}

export class SnapshotRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createOwned(
    userId: string,
    characterId: string,
    derivedStateJson: Prisma.InputJsonValue,
  ): Promise<CharacterSnapshotSummary | null> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.prisma.$transaction(async (transaction) => {
          const character = await transaction.character.findFirst({
            where: { id: characterId, userId },
            select: { id: true },
          });
          if (!character) return null;

          const lastSnapshot = await transaction.characterSnapshot.findFirst({
            where: { characterId },
            orderBy: { version: "desc" },
            select: { version: true },
          });
          const snapshot = await transaction.characterSnapshot.create({
            data: {
              characterId,
              version: (lastSnapshot?.version ?? 0) + 1,
              derivedStateJson,
            },
            select: { id: true, version: true, derivedStateJson: true, createdAt: true },
          });
          return toSnapshotSummary(snapshot);
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      } catch (error) {
        const retryable = error instanceof Prisma.PrismaClientKnownRequestError
          && (error.code === "P2002" || error.code === "P2034");
        if (!retryable || attempt === 2) throw error;
      }
    }

    throw new Error("Could not allocate a snapshot version");
  }

  async getOwnedSheetData(
    userId: string,
    characterId: string,
  ): Promise<Omit<CharacterSheet, "derivedState"> & { calculationInput: OwnedCharacterCalculationInput } | null> {
    const character = await this.prisma.character.findFirst({
      where: { id: characterId, userId },
      select: {
        id: true, templateId: true, name: true, level: true, status: true,
        portraitUrl: true, summaryJson: true, createdAt: true, updatedAt: true,
        template: { select: { id: true, key: true, name: true } },
        stats: { orderBy: { key: "asc" }, select: { id: true, key: true, label: true, baseValue: true, currentValue: true, maxValue: true, metaJson: true, createdAt: true, updatedAt: true } },
        resources: { orderBy: { key: "asc" }, select: { id: true, key: true, label: true, currentValue: true, maxValue: true, resetRule: true, metaJson: true, createdAt: true, updatedAt: true } },
        items: { orderBy: [{ equipped: "desc" }, { name: "asc" }], select: { id: true, name: true, type: true, equipped: true, quantity: true, weight: true, metaJson: true, createdAt: true, updatedAt: true } },
        actions: { orderBy: { name: "asc" }, select: { id: true, name: true, actionType: true, costJson: true, rollJson: true, damageJson: true, metaJson: true, createdAt: true, updatedAt: true } },
        effects: { orderBy: [{ active: "desc" }, { createdAt: "asc" }], select: { id: true, sourceType: true, sourceLabel: true, effectType: true, payloadJson: true, active: true, createdAt: true, updatedAt: true } },
        links: { orderBy: [{ createdAt: "asc" }, { id: "asc" }], select: { id: true, sourceType: true, sourceId: true, targetType: true, targetId: true, operation: true, configJson: true, createdAt: true, updatedAt: true } },
        notes: { orderBy: { section: "asc" }, select: { id: true, section: true, content: true, createdAt: true, updatedAt: true } },
        snapshots: { take: 1, orderBy: { version: "desc" }, select: { id: true, version: true, derivedStateJson: true, createdAt: true } },
      },
    });
    if (!character) return null;

    const stats = character.stats.map((stat) => ({ ...stat, baseValue: asNumber(stat.baseValue), currentValue: asNumber(stat.currentValue), maxValue: asNumber(stat.maxValue) }));
    const resources = character.resources.map((resource) => ({ ...resource, currentValue: asNumber(resource.currentValue), maxValue: asNumber(resource.maxValue) }));
    const items = character.items.map((item) => ({ ...item, weight: asNumber(item.weight) }));
    const links: CharacterLinkSummary[] = character.links.map((link) => ({
      id: link.id,
      source: { type: link.sourceType as CharacterLinkSummary["source"]["type"], id: link.sourceId },
      target: { type: link.targetType as CharacterLinkSummary["target"]["type"], id: link.targetId },
      operation: link.operation,
      configJson: link.configJson,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    }));

    return {
      character: {
        id: character.id, templateId: character.templateId, name: character.name,
        level: character.level, status: character.status, portraitUrl: character.portraitUrl,
        summaryJson: character.summaryJson, createdAt: character.createdAt,
        updatedAt: character.updatedAt, template: character.template,
      },
      stats,
      resources,
      items,
      actions: character.actions,
      effects: character.effects,
      links,
      notes: character.notes,
      latestSnapshot: character.snapshots[0] ? toSnapshotSummary(character.snapshots[0]) : null,
      calculationInput: {
        characterId: character.id,
        stats: stats.map(({ key, baseValue, currentValue, maxValue }) => ({ key, baseValue, currentValue, maxValue })),
        resources: resources.map(({ key, currentValue, maxValue }) => ({ key, currentValue, maxValue })),
        items: items.map(({ id, equipped, quantity, weight }) => ({ id, equipped, quantity, weight })),
        actionIds: character.actions.map((action) => action.id),
        effects: character.effects.map(({ id, active, payloadJson }) => ({ id, active, payloadJson })),
        links,
      },
    };
  }
}
