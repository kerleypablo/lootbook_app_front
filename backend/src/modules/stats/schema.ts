const numericValueSchema = {
  type: ["number", "null"],
  minimum: -99999999.99,
  maximum: 99999999.99,
} as const;

const characterIdParamsSchema = {
  type: "object",
  required: ["id"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
  },
} as const;

const statInputSchema = {
  type: "object",
  required: ["key", "label"],
  additionalProperties: false,
  properties: {
    key: {
      type: "string",
      minLength: 1,
      maxLength: 80,
      pattern: "^[a-z][a-z0-9_:-]*$",
    },
    label: { type: "string", minLength: 1, maxLength: 120 },
    baseValue: numericValueSchema,
    currentValue: numericValueSchema,
    maxValue: numericValueSchema,
    metaJson: {},
  },
} as const;

const statResponseSchema = {
  type: "object",
  required: [
    "id",
    "key",
    "label",
    "baseValue",
    "currentValue",
    "maxValue",
    "metaJson",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: { type: "string", format: "uuid" },
    key: { type: "string" },
    label: { type: "string" },
    baseValue: numericValueSchema,
    currentValue: numericValueSchema,
    maxValue: numericValueSchema,
    metaJson: {},
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const statSchemas = {
  replace: {
    params: characterIdParamsSchema,
    body: {
      type: "object",
      required: ["stats"],
      additionalProperties: false,
      properties: {
        stats: {
          type: "array",
          maxItems: 100,
          items: statInputSchema,
        },
      },
    },
    response: {
      200: {
        type: "object",
        required: ["stats"],
        properties: {
          stats: { type: "array", items: statResponseSchema },
        },
      },
    },
  },
};
