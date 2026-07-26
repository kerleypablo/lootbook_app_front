const characterStatusSchema = {
  type: "string",
  enum: ["DRAFT", "ACTIVE", "ARCHIVED"],
} as const;

const characterIdParamsSchema = {
  type: "object",
  required: ["id"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
  },
} as const;

const characterProperties = {
  name: { type: "string", minLength: 1, maxLength: 120 },
  templateId: { type: ["string", "null"], format: "uuid" },
  level: { type: "integer", minimum: 1 },
  status: characterStatusSchema,
  portraitUrl: { type: ["string", "null"], maxLength: 2048 },
  summaryJson: {},
} as const;

const characterSchema = {
  type: "object",
  required: [
    "id",
    "templateId",
    "name",
    "level",
    "status",
    "portraitUrl",
    "summaryJson",
    "createdAt",
    "updatedAt",
    "template",
  ],
  properties: {
    id: { type: "string", format: "uuid" },
    templateId: { type: ["string", "null"], format: "uuid" },
    name: { type: "string" },
    level: { type: "integer" },
    status: characterStatusSchema,
    portraitUrl: { type: ["string", "null"] },
    summaryJson: {},
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    template: {
      type: ["object", "null"],
      required: ["id", "key", "name"],
      properties: {
        id: { type: "string", format: "uuid" },
        key: { type: "string" },
        name: { type: "string" },
      },
    },
  },
} as const;

export const characterSchemas = {
  create: {
    body: {
      type: "object",
      required: ["name"],
      additionalProperties: false,
      properties: characterProperties,
    },
    response: {
      201: {
        type: "object",
        required: ["character"],
        properties: { character: characterSchema },
      },
    },
  },
  list: {
    response: {
      200: {
        type: "object",
        required: ["characters"],
        properties: {
          characters: { type: "array", items: characterSchema },
        },
      },
    },
  },
  get: {
    params: characterIdParamsSchema,
    response: {
      200: {
        type: "object",
        required: ["character"],
        properties: { character: characterSchema },
      },
    },
  },
  update: {
    params: characterIdParamsSchema,
    body: {
      type: "object",
      minProperties: 1,
      additionalProperties: false,
      properties: characterProperties,
    },
    response: {
      200: {
        type: "object",
        required: ["character"],
        properties: { character: characterSchema },
      },
    },
  },
  delete: {
    params: characterIdParamsSchema,
  },
};
