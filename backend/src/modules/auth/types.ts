export type AuthVerificationMethod = "jwks" | "auth-server" | "guest";

export type SupabaseJwtClaims = {
  aud?: string | string[];
  email?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  phone?: string;
  role?: string;
  session_id?: string;
  sub?: string;
  [key: string]: unknown;
};

export type AuthProviderIdentity = {
  authProviderId: string;
  email: string;
  displayName: string | null;
  issuer: string | null;
  role: string | null;
  sessionId: string | null;
  verificationMethod: AuthVerificationMethod;
  claims: SupabaseJwtClaims;
};

export type AuthenticatedUser = {
  id: string;
  authProviderId: string;
  email: string;
  displayName: string | null;
};

export type AuthenticatedRequestContext = {
  user: AuthenticatedUser;
  auth: {
    issuer: string | null;
    role: string | null;
    sessionId: string | null;
    verificationMethod: AuthVerificationMethod;
  };
};
