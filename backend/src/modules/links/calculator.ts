import { AppError } from "../../shared/errors/app-error.js";
import type {
  AppliedCalculation,
  CharacterLinkSummary,
  CreateCharacterLinkInput,
  LinkReference,
  LinkSourceType,
  LinkTargetType,
  OwnedCharacterCalculationInput,
  RecalculatedCharacterState,
} from "./types.js";
import type { LinkOperation } from "@prisma/client";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asConfig(value: unknown): JsonObject {
  return isObject(value) ? value : {};
}

function numericConfig(config: JsonObject, key: string, required: boolean, fallback = 0) {
  const value = config[key];
  if (value === undefined && !required) return fallback;
  if (typeof value !== "number" || !Number.isFinite(value) || Math.abs(value) > 99_999_999.99) {
    throw new Error(`configJson.${key} must be a finite number`);
  }
  return value;
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 10_000) / 10_000;
}

function validateTargetField(targetType: LinkTargetType, config: JsonObject) {
  const field = config.targetField;
  if (field === undefined) return;
  const allowed = targetType === "STAT"
    ? ["baseValue", "currentValue", "maxValue"]
    : targetType === "RESOURCE"
      ? ["currentValue", "maxValue"]
      : [];
  if (typeof field !== "string" || !allowed.includes(field)) {
    throw new Error(`configJson.targetField is invalid for ${targetType}`);
  }
}

function validateReference(
  reference: LinkReference<LinkSourceType | LinkTargetType>,
  input: OwnedCharacterCalculationInput,
  kind: "source" | "target",
) {
  const exists = (() => {
    switch (reference.type) {
      case "STAT": return input.stats.some((stat) => stat.key === reference.id);
      case "RESOURCE": return input.resources.some((resource) => resource.key === reference.id);
      case "ITEM": return input.items.some((item) => item.id === reference.id);
      case "ACTION": return input.actionIds.includes(reference.id);
      case "EFFECT": return input.effects.some((effect) => effect.id === reference.id);
      case "INVENTORY": return reference.id === "all";
      case "DERIVED": return reference.id.length > 0;
      default: return false;
    }
  })();
  if (!exists) throw new Error(`Link ${kind} does not exist in this character`);
}

type LinkDefinition = Pick<CreateCharacterLinkInput, "source" | "target"> & {
  operation: LinkOperation;
  configJson?: unknown;
};

export function validateLinkDefinition(
  link: LinkDefinition,
  input: OwnedCharacterCalculationInput,
) {
  validateReference(link.source, input, "source");
  validateReference(link.target, input, "target");
  const config = asConfig(link.configJson);
  validateTargetField(link.target.type, config);

  switch (link.operation) {
    case "ADD":
    case "SUBTRACT":
      numericConfig(config, "value", true);
      break;
    case "SET_FROM_STAT": {
      if (link.source.type !== "STAT") throw new Error("SET_FROM_STAT requires a STAT source");
      const sourceField = config.sourceField;
      if (sourceField !== undefined && !["baseValue", "currentValue", "maxValue"].includes(String(sourceField))) {
        throw new Error("configJson.sourceField is invalid");
      }
      numericConfig(config, "multiplier", false, 1);
      numericConfig(config, "offset", false, 0);
      break;
    }
    case "SUM_WEIGHTS":
      if (link.source.type !== "INVENTORY" || link.source.id !== "all") {
        throw new Error("SUM_WEIGHTS requires source INVENTORY/all");
      }
      if (config.onlyEquipped !== undefined && typeof config.onlyEquipped !== "boolean") {
        throw new Error("configJson.onlyEquipped must be boolean");
      }
      break;
    case "CONSUME_RESOURCE":
      if (link.target.type !== "RESOURCE") throw new Error("CONSUME_RESOURCE requires a RESOURCE target");
      if (config.targetField !== undefined && config.targetField !== "currentValue") {
        throw new Error("CONSUME_RESOURCE can only target resource currentValue");
      }
      if (numericConfig(config, "amount", true) < 0) throw new Error("configJson.amount must not be negative");
      numericConfig(config, "clampMin", false, 0);
      break;
  }
}

function createInitialState(input: OwnedCharacterCalculationInput): RecalculatedCharacterState {
  return {
    version: 1,
    characterId: input.characterId,
    stats: Object.fromEntries(input.stats.map((stat) => [stat.key, {
      baseValue: stat.baseValue,
      currentValue: stat.currentValue,
      maxValue: stat.maxValue,
    }])),
    resources: Object.fromEntries(input.resources.map((resource) => [resource.key, {
      currentValue: resource.currentValue,
      maxValue: resource.maxValue,
    }])),
    derived: {},
    applied: [],
    warnings: [],
  };
}

function targetAccessor(
  state: RecalculatedCharacterState,
  target: LinkReference<LinkTargetType>,
  config: JsonObject,
) {
  if (target.type === "DERIVED") {
    return {
      get: () => state.derived[target.id] ?? 0,
      set: (value: number) => { state.derived[target.id] = round(value); },
    };
  }
  if (target.type === "STAT") {
    const stat = state.stats[target.id];
    if (!stat) throw new Error(`Target stat ${target.id} was not found`);
    const field = (config.targetField ?? "currentValue") as "baseValue" | "currentValue" | "maxValue";
    return {
      get: () => stat[field] ?? 0,
      set: (value: number) => { stat[field] = round(value); },
    };
  }
  const resource = state.resources[target.id];
  if (!resource) throw new Error(`Target resource ${target.id} was not found`);
  const field = (config.targetField ?? "currentValue") as "currentValue" | "maxValue";
  return {
    get: () => resource[field] ?? 0,
    set: (value: number) => { resource[field] = round(value); },
  };
}

function apply(
  state: RecalculatedCharacterState,
  input: OwnedCharacterCalculationInput,
  originType: "LINK" | "EFFECT",
  originId: string,
  operation: AppliedCalculation["operation"],
  source: LinkReference<LinkSourceType>,
  target: LinkReference<LinkTargetType>,
  config: JsonObject,
) {
  const accessor = targetAccessor(state, target, config);
  const before = accessor.get();
  let after: number;

  switch (operation) {
    case "ADD": after = before + numericConfig(config, "value", true); break;
    case "SUBTRACT": after = before - numericConfig(config, "value", true); break;
    case "SET_FROM_STAT": {
      const stat = state.stats[source.id];
      if (!stat) throw new Error(`Source stat ${source.id} was not found`);
      const sourceField = (config.sourceField ?? "currentValue") as "baseValue" | "currentValue" | "maxValue";
      const sourceValue = stat[sourceField] ?? (sourceField === "currentValue" ? stat.baseValue : null) ?? 0;
      after = sourceValue * numericConfig(config, "multiplier", false, 1)
        + numericConfig(config, "offset", false, 0);
      break;
    }
    case "SUM_WEIGHTS":
      after = input.items
        .filter((item) => config.onlyEquipped !== true || item.equipped)
        .reduce((sum, item) => sum + (item.weight ?? 0) * item.quantity, 0);
      break;
    case "CONSUME_RESOURCE":
      after = Math.max(
        numericConfig(config, "clampMin", false, 0),
        before - numericConfig(config, "amount", true),
      );
      break;
  }

  if (!Number.isFinite(after)) throw new Error("Calculation produced a non-finite value");
  accessor.set(after);
  state.applied.push({ originType, originId, operation, target, before: round(before), after: round(after) });
}

function applyLink(state: RecalculatedCharacterState, input: OwnedCharacterCalculationInput, link: CharacterLinkSummary) {
  validateLinkDefinition(link, input);
  apply(state, input, "LINK", link.id, link.operation, link.source, link.target, asConfig(link.configJson));
}

function applyEffect(state: RecalculatedCharacterState, input: OwnedCharacterCalculationInput, effect: OwnedCharacterCalculationInput["effects"][number]) {
  if (!effect.active) return;
  const payload = effect.payloadJson;
  if (!isObject(payload) || !isObject(payload.target)) throw new Error("Active effect payload must contain a target object");
  const operation = payload.operation;
  if (operation !== "ADD" && operation !== "SUBTRACT") throw new Error("Active effect operation must be ADD or SUBTRACT");
  const targetType = payload.target.type;
  const targetId = payload.target.id;
  if (!["STAT", "RESOURCE", "DERIVED"].includes(String(targetType)) || typeof targetId !== "string") {
    throw new Error("Active effect target is invalid");
  }
  const config = { value: payload.value, targetField: payload.targetField };
  validateTargetField(targetType as LinkTargetType, config);
  apply(
    state,
    input,
    "EFFECT",
    effect.id,
    operation,
    { type: "EFFECT", id: effect.id },
    { type: targetType as LinkTargetType, id: targetId },
    config,
  );
}

export function recalculateCharacter(input: OwnedCharacterCalculationInput) {
  const state = createInitialState(input);

  for (const link of input.links) {
    try {
      applyLink(state, input, link);
    } catch (error) {
      state.warnings.push({
        originType: "LINK",
        originId: link.id,
        code: "INVALID_LINK",
        message: error instanceof Error ? error.message : "Link could not be applied",
      });
    }
  }

  for (const effect of input.effects) {
    try {
      applyEffect(state, input, effect);
    } catch (error) {
      state.warnings.push({
        originType: "EFFECT",
        originId: effect.id,
        code: "INVALID_EFFECT_PAYLOAD",
        message: error instanceof Error ? error.message : "Effect could not be applied",
      });
    }
  }

  return state;
}

export function invalidLinkError(characterId: string, error: unknown) {
  return new AppError(
    400,
    error instanceof Error ? error.message : "Invalid link",
    { characterId },
    "InvalidLinkError",
  );
}
