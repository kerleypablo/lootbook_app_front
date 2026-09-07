const sourceTypeSchema = {
  type: "string",
  enum: ["STAT", "RESOURCE", "ITEM", "ACTION", "EFFECT", "INVENTORY"],
} as const;
const targetTypeSchema = { type: "string", enum: ["STAT", "RESOURCE", "DERIVED"] } as const;
const operationSchema = {
  type: "string",
  enum: ["ADD", "SUBTRACT", "SET_FROM_STAT", "SUM_WEIGHTS", "CONSUME_RESOURCE"],
} as const;
const referenceIdSchema = {
  type: "string",
  minLength: 1,
  maxLength: 160,
  pattern: "^[A-Za-z0-9][A-Za-z0-9_.:-]*$",
} as const;
const referenceSchema = (typeSchema: typeof sourceTypeSchema | typeof targetTypeSchema) => ({
  type: "object",
  required: ["type", "id"],
  additionalProperties: false,
  properties: { type: typeSchema, id: referenceIdSchema },
}) as const;
const characterIdParamsSchema = {
  type: "object",
  required: ["id"],
  additionalProperties: false,
  properties: { id: { type: "string", format: "uuid" } },
} as const;
const linkIdParamsSchema = {
  type: "object",
  required: ["id", "linkId"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
    linkId: { type: "string", format: "uuid" },
  },
} as const;
const nullableObjectSchema = {
  anyOf: [{ type: "object", additionalProperties: true }, { type: "null" }],
} as const;
const linkSchema = {
  type: "object",
  required: ["id", "source", "target", "operation", "configJson", "createdAt", "updatedAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    source: referenceSchema(sourceTypeSchema),
    target: referenceSchema(targetTypeSchema),
    operation: operationSchema,
    configJson: nullableObjectSchema,
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const linkSchemas = {
  create: {
    params: characterIdParamsSchema,
    body: {
      type: "object",
      required: ["source", "target", "operation"],
      additionalProperties: false,
      properties: {
        source: referenceSchema(sourceTypeSchema),
        target: referenceSchema(targetTypeSchema),
        operation: operationSchema,
        configJson: nullableObjectSchema,
      },
    },
    response: { 201: { type: "object", required: ["link"], properties: { link: linkSchema } } },
  },
  list: {
    params: characterIdParamsSchema,
    response: { 200: { type: "object", required: ["links"], properties: { links: { type: "array", items: linkSchema } } } },
  },
  delete: { params: linkIdParamsSchema },
  recalculate: {
    params: characterIdParamsSchema,
    response: {
      200: {
        type: "object",
        required: ["state", "snapshot"],
        properties: {
          state: { type: "object", additionalProperties: true },
          snapshot: { type: "object", additionalProperties: true },
        },
      },
    },
  },
};
