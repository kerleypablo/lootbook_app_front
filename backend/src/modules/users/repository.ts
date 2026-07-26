import type { PrismaClient } from "@prisma/client";
import type { AuthProviderIdentity } from "../auth/types.js";
import type { UserProfile } from "./types.js";

const GUEST_AUTH_PROVIDER_ID = "local-development-guest";
const GUEST_EMAIL = "guest@lootbook.invalid";
const GUEST_DISPLAY_NAME = "Convidado";

const userSelect = {
  id: true,
  authProviderId: true,
  email: true,
  displayName: true,
} as const;

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsertFromAuthIdentity(
    identity: AuthProviderIdentity,
  ): Promise<UserProfile> {
    return this.prisma.user.upsert({
      where: {
        authProviderId: identity.authProviderId,
      },
      create: {
        authProviderId: identity.authProviderId,
        email: identity.email,
        displayName: identity.displayName,
      },
      update: {
        email: identity.email,
        displayName: identity.displayName,
      },
      select: userSelect,
    });
  }

  async findById(id: string): Promise<UserProfile | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  }

  async upsertGuestUser(): Promise<UserProfile> {
    return this.prisma.user.upsert({
      where: {
        authProviderId: GUEST_AUTH_PROVIDER_ID,
      },
      create: {
        authProviderId: GUEST_AUTH_PROVIDER_ID,
        email: GUEST_EMAIL,
        displayName: GUEST_DISPLAY_NAME,
      },
      update: {
        email: GUEST_EMAIL,
        displayName: GUEST_DISPLAY_NAME,
      },
      select: userSelect,
    });
  }
}
