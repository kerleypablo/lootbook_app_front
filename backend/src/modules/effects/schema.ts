const effectTypeSchema = {
  type: "string",
  enum: ["BUFF", "DEBUFF", "PASSIVE", "TRIGGERED", "CUSTOM"],
} as const;

const objectSchema = { type: "object", additionalProperties: true } as const;
const characterIdParamsSchema = {
  type: "object",
  required: ["id"],
  additionalProperties: false,
  properties: { id: { type: "string", format: "uuid" } },
} as const;
const effectIdParamsSchema = {
  type: "object",
  required: ["id", "effectId"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    effectId: { type: "string", format: "uuid" },
  },
} as const;

const effectProperties = {
  sourceType: { type: "string", minLength: 1, maxLength: 80, pattern: "^[a-z][a-z0-9_:-]*$" },
  sourceLabel: { type: "string", minLength: 1, maxLength: 160 },
  effectType: effectTypeSchema,
  payloadJson: objectSchema,
  active: { type: "boolean" },
} as const;

const effectResponseSchema = {
  type: "object",
  required: ["id", "sourceType", "sourceLabel", "effectType", "payloadJson", "active", "createdAt", "updatedAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    ...effectProperties,
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const effectSchemas = {
  create: {
    params: characterIdParamsSchema,
    body: {
      type: "object",
      required: ["sourceType", "sourceLabel", "effectType", "payloadJson"],
      additionalProperties: false,
      properties: effectProperties,
    },
    response: { 201: { type: "object", required: ["effect"], properties: { effect: effectResponseSchema } } },
  },
  list: {
    params: characterIdParamsSchema,
    response: { 200: { type: "object", required: ["effects"], properties: { effects: { type: "array", items: effectResponseSchema } } } },
  },
  update: {
    params: effectIdParamsSchema,
    body: { type: "object", minProperties: 1, additionalProperties: false, properties: effectProperties },
    response: { 200: { type: "object", required: ["effect"], properties: { effect: effectResponseSchema } } },
  },
  delete: { params: effectIdParamsSchema },
};
