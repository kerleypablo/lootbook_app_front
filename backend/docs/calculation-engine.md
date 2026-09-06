# Calculation engine V1

The calculation engine connects character entities without assuming a specific RPG system. Recalculation reads the persisted base data once, applies links in stable creation order, then applies active effects. It returns derived state without updating stats, resources, or other source records.

## Link shape

```json
{
  "source": { "type": "ITEM", "id": "entity-id-or-key" },
  "target": { "type": "STAT", "id": "defense" },
  "operation": "ADD",
  "configJson": { "value": 3 }
}
```

Source types are `STAT`, `RESOURCE`, `ITEM`, `ACTION`, `EFFECT`, and `INVENTORY`. Target types are `STAT`, `RESOURCE`, and `DERIVED`. Stat and resource references use their character-local key. Item, action, and effect references use their UUID. The inventory source uses the fixed ID `all`.

Links are validated against the owned character when created. If a referenced entity is later removed, recalculation skips that link and returns an `INVALID_LINK` warning.

## Operations

- `ADD`: adds `configJson.value` to the target.
- `SUBTRACT`: subtracts `configJson.value` from the target.
- `SET_FROM_STAT`: sets the target from a source stat, with optional `sourceField`, `multiplier`, and `offset`.
- `SUM_WEIGHTS`: sets the target to the sum of item `weight * quantity`; `onlyEquipped` is optional.
- `CONSUME_RESOURCE`: subtracts `amount` from a resource's derived `currentValue`, with optional `clampMin` (default `0`). It does not persist consumption.

Targets default to `currentValue` for stats and resources. `targetField` may explicitly select another compatible numeric field, except for `CONSUME_RESOURCE`, which always targets `currentValue`.

## Active effect shape

Active effects may contribute an `ADD` or `SUBTRACT` modifier:

```json
{
  "operation": "ADD",
  "target": { "type": "STAT", "id": "defense" },
  "value": 2,
  "targetField": "currentValue"
}
```

Other effect payloads remain valid data but are not interpreted by engine V1. They produce an `INVALID_EFFECT_PAYLOAD` warning during recalculation.

## Endpoint

`POST /characters/:id/recalculate` requires authentication and character ownership. The response contains:

- `stats` and `resources` with calculated numeric values;
- arbitrary numeric `derived` fields;
- an ordered `applied` audit trail;
- non-fatal `warnings` for stale or unsupported rules.
