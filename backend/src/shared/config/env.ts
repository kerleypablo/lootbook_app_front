import "dotenv/config";

type Env = {
  NODE_ENV: string;
  HOST: string;
  PORT: number;
  LOG_LEVEL: string;
  AUTH_REQUIRED: boolean;
  DATABASE_URL: string;
  DIRECT_URL: string;
  SUPABASE_URL?: string;
  SUPABASE_JWKS_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

function parseBooleanEnv(name: string, fallback: boolean) {
  const value = optionalEnv(name);

  if (value === undefined) {
    return fallback;
  }

  if (value !== "true" && value !== "false") {
    throw new Error(`${name} must be either "true" or "false"`);
  }

  return value === "true";
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const authRequired = parseBooleanEnv("AUTH_REQUIRED", nodeEnv !== "development");

if (!authRequired && nodeEnv !== "development") {
  throw new Error(
    "AUTH_REQUIRED=false is only allowed when NODE_ENV=development",
  );
}

export const env: Env = {
  NODE_ENV: nodeEnv,
  HOST: process.env.HOST ?? "0.0.0.0",
  PORT: Number(process.env.PORT ?? 3333),
  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  AUTH_REQUIRED: authRequired,
  DATABASE_URL: requireEnv("DATABASE_URL"),
  DIRECT_URL: requireEnv("DIRECT_URL"),
  SUPABASE_URL: optionalEnv("SUPABASE_URL"),
  SUPABASE_JWKS_URL: optionalEnv("SUPABASE_JWKS_URL"),
  SUPABASE_PUBLISHABLE_KEY: optionalEnv("SUPABASE_PUBLISHABLE_KEY"),
  SUPABASE_ANON_KEY: optionalEnv("SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: optionalEnv("SUPABASE_SERVICE_ROLE_KEY"),
};
