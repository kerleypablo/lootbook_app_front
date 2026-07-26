INSERT INTO "character_templates" (
  "id",
  "key",
  "name",
  "description",
  "system_family",
  "is_official",
  "config_json",
  "created_at",
  "updated_at"
)
VALUES (
  gen_random_uuid(),
  'ficha-livre',
  'Ficha livre',
  'Modelo sem regras de sistema predefinidas.',
  'livre',
  true,
  '{"version":1,"fields":[]}'::jsonb,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO NOTHING;
