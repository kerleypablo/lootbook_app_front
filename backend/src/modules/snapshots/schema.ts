const characterIdParamsSchema = {
  type: "object",
  required: ["id"],
  additionalProperties: false,
  properties: { id: { type: "string", format: "uuid" } },
} as const;

export const snapshotSchemas = {
  sheet: {
    params: characterIdParamsSchema,
    response: {
      200: {
        type: "object",
        required: ["sheet"],
        properties: {
          sheet: { type: "object", additionalProperties: true },
        },
      },
    },
  },
};
