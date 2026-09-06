const actionTypeSchema = {
  type: "string",
  enum: ["ATTACK", "SPELL", "SKILL", "FEATURE", "CUSTOM"],
} as const;

const characterIdParamsSchema = {
  type: "object",
  required: ["id"],
  additionalProperties: false,
  properties: { id: { type: "string", format: "uuid" } },
} as const;

const actionIdParamsSchema = {
  type: "object",
  required: ["id", "actionId"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    actionId: { type: "string", format: "uuid" },
  },
} as const;

const nullableObjectSchema = {
  anyOf: [
    { type: "object", additionalProperties: true },
    { type: "null" },
  ],
} as const;

const actionProperties = {
  name: { type: "string", minLength: 1, maxLength: 160 },
  actionType: actionTypeSchema,
  costJson: nullableObjectSchema,
  rollJson: nullableObjectSchema,
  damageJson: nullableObjectSchema,
  metaJson: nullableObjectSchema,
} as const;

const actionResponseSchema = {
  type: "object",
  required: ["id", "name", "actionType", "costJson", "rollJson", "damageJson", "metaJson", "createdAt", "updatedAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    ...actionProperties,
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const actionSchemas = {
  create: {
    params: characterIdParamsSchema,
    body: { type: "object", required: ["name", "actionType"], additionalProperties: false, properties: actionProperties },
    response: { 201: { type: "object", required: ["action"], properties: { action: actionResponseSchema } } },
  },
  list: {
    params: characterIdParamsSchema,
    response: { 200: { type: "object", required: ["actions"], properties: { actions: { type: "array", items: actionResponseSchema } } } },
  },
  update: {
    params: actionIdParamsSchema,
    body: { type: "object", minProperties: 1, additionalProperties: false, properties: actionProperties },
    response: { 200: { type: "object", required: ["action"], properties: { action: actionResponseSchema } } },
  },
  delete: { params: actionIdParamsSchema },
};
