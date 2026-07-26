const templateSchema = {
  type: "object",
  required: [
    "id",
    "key",
    "name",
    "description",
    "systemFamily",
    "isOfficial",
    "configJson",
  ],
  properties: {
    id: { type: "string", format: "uuid" },
    key: { type: "string" },
    name: { type: "string" },
    description: { type: ["string", "null"] },
    systemFamily: { type: ["string", "null"] },
    isOfficial: { type: "boolean" },
    configJson: {},
  },
} as const;

export const templateSchemas = {
  list: {
    response: {
      200: {
        type: "object",
        required: ["templates"],
        properties: {
          templates: {
            type: "array",
            items: templateSchema,
          },
        },
      },
    },
  },
};
