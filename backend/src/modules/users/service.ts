import type { FastifyBaseLogger } from "fastify";
import type { AuthProviderIdentity } from "../auth/types.js";
import { UserRepository } from "./repository.js";
import type { UserProfile } from "./types.js";

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async syncAuthenticatedUser(
    identity: AuthProviderIdentity,
    logger: FastifyBaseLogger,
  ): Promise<UserProfile> {
    try {
      return await this.repository.upsertFromAuthIdentity(identity);
    } catch (error) {
      logger.error(
        {
          err: error,
          authProviderId: identity.authProviderId,
          email: identity.email,
        },
        "Failed to sync authenticated user into the local database",
      );

      throw error;
    }
  }

  async getGuestUser(logger: FastifyBaseLogger): Promise<UserProfile> {
    try {
      return await this.repository.upsertGuestUser();
    } catch (error) {
      logger.error(
        { err: error },
        "Failed to create or load the temporary guest user",
      );
      throw error;
    }
  }
}
