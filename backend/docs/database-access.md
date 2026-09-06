# Database access and RLS

The backend and the Supabase Data API use separate trust boundaries.

## Fastify and Prisma

Fastify reads `DATABASE_URL` and `DIRECT_URL` only from the backend environment. The current production connection uses the PostgreSQL `postgres` role with `BYPASSRLS`, so row-level security is not the backend's authorization mechanism. Every backend query that handles user data must continue filtering by the authenticated internal user ID.

These connection strings and `SUPABASE_SERVICE_ROLE_KEY` are server-only secrets. They must never use a `NEXT_PUBLIC_` prefix or be included in frontend code.

## Supabase Data API

- `anon` may only read official rows from `character_templates`.
- `authenticated` may read its own row from `users`.
- `authenticated` may create, read, update, and delete only its own `characters` and child records.
- `users` and `character_templates` are managed by the backend; Data API clients cannot mutate them.
- Every update policy has both `USING` and `WITH CHECK`, preventing a row from being reassigned to another owner.

Ownership maps the JWT `auth.uid()` to `users.auth_provider_id`, then follows `characters.user_id`. Child records inherit ownership through `character_id`.
