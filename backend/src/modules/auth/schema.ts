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

const authenticatedContextSchema = {
  type: "object",
  required: ["issuer", "role", "sessionId", "verificationMethod"],
  properties: {
    issuer: { type: ["string", "null"] },
    role: { type: ["string", "null"] },
    sessionId: { type: ["string", "null"] },
    verificationMethod: {
      type: "string",
      enum: ["jwks", "auth-server", "guest"],
    },
  },
} as const;

export const authSchemas = {
  validateSession: {
    response: {
      200: {
        type: "object",
        required: ["user", "auth"],
        properties: {
          user: authenticatedUserSchema,
          auth: authenticatedContextSchema,
        },
      },
    },
  },
};
