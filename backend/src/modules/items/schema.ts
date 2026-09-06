const itemTypeSchema = {
  type: "string",
  enum: ["WEAPON", "ARMOR", "EQUIPMENT", "CONSUMABLE", "LOOT", "CUSTOM"],
} as const;

const characterIdParamsSchema = {
  type: "object",
  required: ["id"],
  additionalProperties: false,
  properties: { id: { type: "string", format: "uuid" } },
} as const;

const itemIdParamsSchema = {
  type: "object",
  required: ["id", "itemId"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    itemId: { type: "string", format: "uuid" },
  },
} as const;

const nullableObjectSchema = {
  anyOf: [
    { type: "object", additionalProperties: true },
    { type: "null" },
  ],
} as const;

const itemProperties = {
  name: { type: "string", minLength: 1, maxLength: 160 },
  type: itemTypeSchema,
  equipped: { type: "boolean" },
  quantity: { type: "integer", minimum: 0, maximum: 999999 },
  weight: { type: ["number", "null"], minimum: 0, maximum: 99999999.99 },
  metaJson: nullableObjectSchema,
} as const;

const itemResponseSchema = {
  type: "object",
  required: [
    "id", "name", "type", "equipped", "quantity", "weight",
    "metaJson", "createdAt", "updatedAt",
  ],
  properties: {
    id: { type: "string", format: "uuid" },
    ...itemProperties,
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const itemSchemas = {
  create: {
    params: characterIdParamsSchema,
    body: {
      type: "object",
      required: ["name", "type"],
      additionalProperties: false,
      properties: itemProperties,
    },
    response: {
      201: {
        type: "object",
        required: ["item"],
        properties: { item: itemResponseSchema },
      },
    },
  },
  list: {
    params: characterIdParamsSchema,
    response: {
      200: {
        type: "object",
        required: ["items"],
        properties: { items: { type: "array", items: itemResponseSchema } },
      },
    },
  },
  update: {
    params: itemIdParamsSchema,
    body: {
      type: "object",
      minProperties: 1,
      additionalProperties: false,
      properties: itemProperties,
    },
    response: {
      200: {
        type: "object",
        required: ["item"],
        properties: { item: itemResponseSchema },
      },
    },
  },
  delete: { params: itemIdParamsSchema },
};
