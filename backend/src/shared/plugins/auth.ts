import fp from "fastify-plugin";
import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";
import { AuthRepository } from "../../modules/auth/repository.js";
import { AuthService } from "../../modules/auth/service.js";
import type {
  AuthenticatedRequestContext,
  AuthenticatedUser,
} from "../../modules/auth/types.js";
import { UserRepository } from "../../modules/users/repository.js";
import { UserService } from "../../modules/users/service.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }

  interface FastifyRequest {
    auth: AuthenticatedRequestContext["auth"] | null;
    user: AuthenticatedUser | null;
  }
}

export const authPlugin = fp(async (app) => {
  app.decorateRequest("auth", null);
  app.decorateRequest("user", null);

  const fallbackApiKey = env.SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_ANON_KEY;
  const authRepository =
    env.SUPABASE_URL && fallbackApiKey
      ? new AuthRepository(env.SUPABASE_URL, fallbackApiKey)
      : null;
  const authService = new AuthService(authRepository);
  const userService = new UserService(new UserRepository(app.prisma));

  if (!env.AUTH_REQUIRED) {
    app.log.warn(
      "Authentication is disabled. Requests without a token use the temporary guest user.",
    );
  }

  app.decorate(
    "authenticate",
    async (request: FastifyRequest) => {
      try {
        if (!env.AUTH_REQUIRED && !request.headers.authorization) {
          const user = await userService.getGuestUser(request.log);

          request.user = {
            id: user.id,
            authProviderId: user.authProviderId,
            email: user.email,
            displayName: user.displayName,
          };
          request.auth = {
            issuer: null,
            role: "guest",
            sessionId: null,
            verificationMethod: "guest",
          };
          return;
        }

        const accessToken = authService.extractAccessToken(
          request.headers.authorization,
        );
        const identity = await authService.authenticateAccessToken(
          accessToken,
          request.log,
        );
        const user = await userService.syncAuthenticatedUser(
          identity,
          request.log,
        );

        request.user = {
          id: user.id,
          authProviderId: user.authProviderId,
          email: user.email,
          displayName: user.displayName,
        };
        request.auth = {
          issuer: identity.issuer,
          role: identity.role,
          sessionId: identity.sessionId,
          verificationMethod: identity.verificationMethod,
        };
      } catch (error) {
        if (error instanceof AppError) {
          request.log.warn(
            {
              errorName: error.name,
              statusCode: error.statusCode,
              details: error.details ?? null,
            },
            "Authentication failed for incoming request",
          );

          throw error;
        }

        request.log.error(
          {
            err: error,
          },
          "Unexpected authentication error",
        );

        throw new AppError(
          500,
          "Unexpected authentication error",
          undefined,
          "AuthenticationError",
        );
      }
    },
  );
});
