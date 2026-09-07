import assert from "node:assert/strict";
import test from "node:test";

const { recalculateCharacter } = await import("../dist/modules/links/calculator.js");

function input(overrides = {}) {
  return {
    characterId: "character-1",
    stats: [
      { key: "strength", baseValue: 4, currentValue: 4, maxValue: null },
      { key: "defense", baseValue: 10, currentValue: 10, maxValue: null },
    ],
    resources: [{ key: "mana", currentValue: 8, maxValue: 10 }],
    items: [
      { id: "item-equipped", equipped: true, quantity: 2, weight: 1.5 },
      { id: "item-bag", equipped: false, quantity: 3, weight: 2 },
    ],
    actionIds: ["action-1"],
    effects: [],
    links: [],
    ...overrides,
  };
}

function link({ id, source, target, operation, configJson }) {
  return {
    id,
    source,
    target,
    operation,
    configJson,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

test("ADD and SUBTRACT update the selected derived target in creation order", () => {
  const state = recalculateCharacter(input({
    links: [
      link({ id: "add", source: { type: "ITEM", id: "item-equipped" }, target: { type: "STAT", id: "defense" }, operation: "ADD", configJson: { value: 3 } }),
      link({ id: "subtract", source: { type: "ACTION", id: "action-1" }, target: { type: "STAT", id: "defense" }, operation: "SUBTRACT", configJson: { value: 1.5 } }),
    ],
  }));

  assert.equal(state.stats.defense.currentValue, 11.5);
  assert.deepEqual(state.applied.map((entry) => entry.after), [13, 11.5]);
  assert.deepEqual(state.warnings, []);
});

test("SET_FROM_STAT uses source field, multiplier and offset", () => {
  const state = recalculateCharacter(input({
    links: [link({
      id: "set-from-stat",
      source: { type: "STAT", id: "strength" },
      target: { type: "DERIVED", id: "attack_bonus" },
      operation: "SET_FROM_STAT",
      configJson: { sourceField: "baseValue", multiplier: 2, offset: 1 },
    })],
  }));

  assert.equal(state.derived.attack_bonus, 9);
  assert.equal(state.applied[0].before, 0);
  assert.equal(state.applied[0].after, 9);
});

test("SUM_WEIGHTS respects onlyEquipped and item quantities", () => {
  const equippedState = recalculateCharacter(input({
    links: [link({
      id: "equipped-weight",
      source: { type: "INVENTORY", id: "all" },
      target: { type: "DERIVED", id: "equipped_weight" },
      operation: "SUM_WEIGHTS",
      configJson: { onlyEquipped: true },
    })],
  }));
  const allState = recalculateCharacter(input({
    links: [link({
      id: "all-weight",
      source: { type: "INVENTORY", id: "all" },
      target: { type: "DERIVED", id: "all_weight" },
      operation: "SUM_WEIGHTS",
      configJson: {},
    })],
  }));

  assert.equal(equippedState.derived.equipped_weight, 3);
  assert.equal(allState.derived.all_weight, 9);
});

test("CONSUME_RESOURCE only changes derived state and honors clampMin", () => {
  const source = input({
    links: [link({
      id: "consume-mana",
      source: { type: "ACTION", id: "action-1" },
      target: { type: "RESOURCE", id: "mana" },
      operation: "CONSUME_RESOURCE",
      configJson: { amount: 12, clampMin: 1 },
    })],
  });
  const state = recalculateCharacter(source);

  assert.equal(state.resources.mana.currentValue, 1);
  assert.equal(source.resources[0].currentValue, 8);
});

test("active effects are applied and invalid stale rules become warnings without breaking recalculation", () => {
  const calculationInput = input({
    effects: [{
      id: "effect-1",
      active: true,
      payloadJson: { operation: "ADD", target: { type: "STAT", id: "defense" }, value: 2 },
    }],
    links: [link({
      id: "stale-link",
      source: { type: "ITEM", id: "missing-item" },
      target: { type: "STAT", id: "defense" },
      operation: "ADD",
      configJson: { value: 3 },
    })],
  });

  const first = recalculateCharacter(calculationInput);
  const second = recalculateCharacter(calculationInput);

  assert.equal(first.stats.defense.currentValue, 12);
  assert.deepEqual(first, second);
  assert.equal(first.warnings.length, 1);
  assert.equal(first.warnings[0].code, "INVALID_LINK");
  assert.equal(first.warnings[0].originId, "stale-link");
});
