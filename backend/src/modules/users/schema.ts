const authenticatedUserSchema = {
  type: "object",
  required: ["id", "authProviderId", "email", "displayName"],
  properties: {
    id: { type: "string" },
    authProviderId: { type: "string" },
    email: { type: "string", format: "email" },
    displayName: { type: ["string", "null"] },
  },
} as const;

export const userSchemas = {
  getMe: {
    response: {
      200: {
        type: "object",
        required: ["user"],
        properties: {
          user: authenticatedUserSchema,
        },
      },
    },
  },
};
