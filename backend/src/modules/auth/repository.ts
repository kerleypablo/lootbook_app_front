import type { FastifyBaseLogger } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";

type SupabaseUserResponse = {
  id?: string;
  email?: string;
  role?: string;
  aud?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

export class AuthRepository {
  constructor(
    private readonly supabaseUrl: string,
    private readonly apiKey: string,
  ) {}

  async fetchUserWithToken(
    accessToken: string,
    logger: FastifyBaseLogger,
  ): Promise<SupabaseUserResponse> {
    const url = new URL("/auth/v1/user", this.supabaseUrl);

    let response: Response;

    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          apikey: this.apiKey,
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      logger.error(
        {
          err: error,
          url: url.toString(),
        },
        "Failed to reach Supabase Auth server during token validation",
      );

      throw new AppError(
        502,
        "Failed to validate session with Supabase Auth",
        undefined,
        "UpstreamAuthError",
      );
    }

    if (!response.ok) {
      const responseBody = await response.text();

      logger.warn(
        {
          statusCode: response.status,
          url: url.toString(),
          responseBody,
        },
        "Supabase Auth server rejected the provided access token",
      );

      throw new AppError(
        401,
        "Invalid or expired access token",
        undefined,
        "AuthenticationError",
      );
    }

    return (await response.json()) as SupabaseUserResponse;
  }
}
