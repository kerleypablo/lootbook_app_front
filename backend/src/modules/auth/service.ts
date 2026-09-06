import type { FastifyBaseLogger } from "fastify";
import {
  createRemoteJWKSet,
  decodeProtectedHeader,
  errors as JoseErrors,
  jwtVerify,
} from "jose";
import { env } from "../../shared/config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { AuthRepository } from "./repository.js";
import type { AuthProviderIdentity, SupabaseJwtClaims } from "./types.js";

function extractDisplayName(
  metadata: Record<string, unknown> | undefined,
): string | null {
  const candidates = [
    metadata?.full_name,
    metadata?.name,
    metadata?.display_name,
    metadata?.user_name,
    metadata?.preferred_username,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return null;
}

function normalizeSupabaseUrl(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}

export class AuthService {
  private readonly expectedIssuer: string;
  private readonly remoteJwks: ReturnType<typeof createRemoteJWKSet> | null;

  constructor(private readonly repository: AuthRepository | null) {
    if (!env.SUPABASE_URL) {
      throw new AppError(
        500,
        "SUPABASE_URL is required to use authenticated routes",
        undefined,
        "ConfigurationError",
      );
    }

    this.expectedIssuer = new URL("/auth/v1", normalizeSupabaseUrl(env.SUPABASE_URL))
      .toString()
      .replace(/\/$/, "");

    this.remoteJwks = env.SUPABASE_JWKS_URL
      ? createRemoteJWKSet(new URL(env.SUPABASE_JWKS_URL))
      : null;
  }

  extractAccessToken(authorizationHeader: string | undefined): string {
    if (!authorizationHeader) {
      throw new AppError(
        401,
        "Missing Authorization header",
        undefined,
        "AuthenticationError",
      );
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new AppError(
        401,
        "Authorization header must use the Bearer scheme",
        undefined,
        "AuthenticationError",
      );
    }

    return token;
  }

  async authenticateAccessToken(
    accessToken: string,
    logger: FastifyBaseLogger,
  ): Promise<AuthProviderIdentity> {
    let header: ReturnType<typeof decodeProtectedHeader>;

    try {
      header = decodeProtectedHeader(accessToken);
    } catch (error) {
      logger.warn({ err: error }, "Received a malformed access token");
      throw new AppError(
        401,
        "Invalid or expired access token",
        undefined,
        "AuthenticationError",
      );
    }

    const algorithm = typeof header.alg === "string" ? header.alg : null;

    if (this.remoteJwks && algorithm && algorithm !== "HS256") {
      try {
        const verificationResult = await jwtVerify(accessToken, this.remoteJwks, {
          issuer: this.expectedIssuer,
        });

        return this.mapClaimsToIdentity(
          verificationResult.payload as SupabaseJwtClaims,
          "jwks",
        );
      } catch (error) {
        logger.error(
          {
            err: error,
            algorithm,
            issuer: this.expectedIssuer,
          },
          "Failed to verify Supabase JWT via JWKS",
        );

        if (
          !(error instanceof JoseErrors.JWKSNoMatchingKey) &&
          !(error instanceof JoseErrors.JOSEError)
        ) {
          throw error;
        }
      }
    }

    if (!this.repository) {
      logger.error(
        {
          algorithm,
          hasJwksUrl: Boolean(env.SUPABASE_JWKS_URL),
        },
        "Supabase Auth fallback verification is unavailable because no API key is configured",
      );

      throw new AppError(
        500,
        "Supabase Auth fallback verification is not configured",
        undefined,
        "ConfigurationError",
      );
    }

    logger.warn(
      {
        algorithm,
        verificationMethod: "auth-server",
      },
      "Falling back to Supabase Auth server for access token verification",
    );

    const supabaseUser = await this.repository.fetchUserWithToken(
      accessToken,
      logger,
    );

    return this.mapClaimsToIdentity(
      {
        sub: supabaseUser.id,
        email: supabaseUser.email,
        role: supabaseUser.role,
        iss: this.expectedIssuer,
      },
      "auth-server",
      supabaseUser.user_metadata,
    );
  }

  private mapClaimsToIdentity(
    claims: SupabaseJwtClaims,
    verificationMethod: "jwks" | "auth-server",
    userMetadata?: Record<string, unknown>,
  ): AuthProviderIdentity {
    if (!claims.sub || typeof claims.sub !== "string") {
      throw new AppError(
        401,
        "Token is missing the required subject claim",
        undefined,
        "AuthenticationError",
      );
    }

    if (!claims.email || typeof claims.email !== "string") {
      throw new AppError(
        422,
        "Authenticated user is missing an email claim required by the backend",
        undefined,
        "AuthenticationError",
      );
    }

    const claimsUserMetadata =
      !userMetadata &&
      typeof claims.user_metadata === "object" &&
      claims.user_metadata !== null
        ? (claims.user_metadata as Record<string, unknown>)
        : userMetadata;

    return {
      authProviderId: claims.sub,
      email: claims.email,
      displayName: extractDisplayName(claimsUserMetadata),
      issuer: typeof claims.iss === "string" ? claims.iss : null,
      role: typeof claims.role === "string" ? claims.role : null,
      sessionId:
        typeof claims.session_id === "string" ? claims.session_id : null,
      verificationMethod,
      claims,
    };
  }
}
