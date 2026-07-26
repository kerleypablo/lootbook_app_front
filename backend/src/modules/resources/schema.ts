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

const resourceInputSchema = {
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
    currentValue: numericValueSchema,
    maxValue: numericValueSchema,
    resetRule: { type: ["string", "null"], maxLength: 120 },
    metaJson: {},
  },
} as const;

const resourceResponseSchema = {
  type: "object",
  required: [
    "id",
    "key",
    "label",
    "currentValue",
    "maxValue",
    "resetRule",
    "metaJson",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: { type: "string", format: "uuid" },
    key: { type: "string" },
    label: { type: "string" },
    currentValue: numericValueSchema,
    maxValue: numericValueSchema,
    resetRule: { type: ["string", "null"] },
    metaJson: {},
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const resourceSchemas = {
  replace: {
    params: characterIdParamsSchema,
    body: {
      type: "object",
      required: ["resources"],
      additionalProperties: false,
      properties: {
        resources: {
          type: "array",
          maxItems: 100,
          items: resourceInputSchema,
        },
      },
    },
    response: {
      200: {
        type: "object",
        required: ["resources"],
        properties: {
          resources: { type: "array", items: resourceResponseSchema },
        },
      },
    },
  },
};
