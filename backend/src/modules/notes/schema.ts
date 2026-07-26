const characterIdParamsSchema = {
  type: "object",
  required: ["id"],
  additionalProperties: false,
  properties: {
    id: { type: "string", format: "uuid" },
  },
} as const;

const noteInputSchema = {
  type: "object",
  required: ["section", "content"],
  additionalProperties: false,
  properties: {
    section: { type: "string", minLength: 1, maxLength: 120 },
    content: { type: "string", minLength: 1, maxLength: 50000 },
  },
} as const;

const noteResponseSchema = {
  type: "object",
  required: ["id", "section", "content", "createdAt", "updatedAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    section: { type: "string" },
    content: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const noteSchemas = {
  replace: {
    params: characterIdParamsSchema,
    body: {
      type: "object",
      required: ["notes"],
      additionalProperties: false,
      properties: {
        notes: {
          type: "array",
          maxItems: 100,
          items: noteInputSchema,
        },
      },
    },
    response: {
      200: {
        type: "object",
        required: ["notes"],
        properties: {
          notes: { type: "array", items: noteResponseSchema },
        },
      },
    },
  },
};
