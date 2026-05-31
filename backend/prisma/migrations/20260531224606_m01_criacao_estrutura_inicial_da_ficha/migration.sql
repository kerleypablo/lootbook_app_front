-- CreateEnum
CREATE TYPE "CharacterStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('WEAPON', 'ARMOR', 'EQUIPMENT', 'CONSUMABLE', 'LOOT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('ATTACK', 'SPELL', 'SKILL', 'FEATURE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EffectType" AS ENUM ('BUFF', 'DEBUFF', 'PASSIVE', 'TRIGGERED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "LinkOperation" AS ENUM ('ADD', 'SUBTRACT', 'SET_FROM_STAT', 'SUM_WEIGHTS', 'CONSUME_RESOURCE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auth_provider_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "system_family" TEXT,
    "is_official" BOOLEAN NOT NULL DEFAULT false,
    "config_json" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "character_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "template_id" UUID,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "status" "CharacterStatus" NOT NULL DEFAULT 'DRAFT',
    "portrait_url" TEXT,
    "summary_json" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_stats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "character_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "base_value" DECIMAL(10,2),
    "current_value" DECIMAL(10,2),
    "max_value" DECIMAL(10,2),
    "meta_json" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "character_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_resources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "character_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "current_value" DECIMAL(10,2),
    "max_value" DECIMAL(10,2),
    "reset_rule" TEXT,
    "meta_json" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "character_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "character_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "weight" DECIMAL(10,2),
    "meta_json" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "character_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_actions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "character_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "action_type" "ActionType" NOT NULL,
    "cost_json" JSONB,
    "roll_json" JSONB,
    "damage_json" JSONB,
    "meta_json" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "character_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_effects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "character_id" UUID NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_label" TEXT NOT NULL,
    "effect_type" "EffectType" NOT NULL,
    "payload_json" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "character_effects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_links" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "character_id" UUID NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "operation" "LinkOperation" NOT NULL,
    "config_json" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "character_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "character_id" UUID NOT NULL,
    "section" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "character_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "character_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "derived_state_json" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "character_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_provider_id_key" ON "users"("auth_provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "character_templates_key_key" ON "character_templates"("key");

-- CreateIndex
CREATE INDEX "characters_user_id_idx" ON "characters"("user_id");

-- CreateIndex
CREATE INDEX "characters_template_id_idx" ON "characters"("template_id");

-- CreateIndex
CREATE INDEX "character_stats_character_id_idx" ON "character_stats"("character_id");

-- CreateIndex
CREATE UNIQUE INDEX "character_stats_character_id_key_key" ON "character_stats"("character_id", "key");

-- CreateIndex
CREATE INDEX "character_resources_character_id_idx" ON "character_resources"("character_id");

-- CreateIndex
CREATE UNIQUE INDEX "character_resources_character_id_key_key" ON "character_resources"("character_id", "key");

-- CreateIndex
CREATE INDEX "character_items_character_id_idx" ON "character_items"("character_id");

-- CreateIndex
CREATE INDEX "character_actions_character_id_idx" ON "character_actions"("character_id");

-- CreateIndex
CREATE INDEX "character_effects_character_id_idx" ON "character_effects"("character_id");

-- CreateIndex
CREATE INDEX "character_links_character_id_idx" ON "character_links"("character_id");

-- CreateIndex
CREATE INDEX "character_notes_character_id_idx" ON "character_notes"("character_id");

-- CreateIndex
CREATE INDEX "character_snapshots_character_id_idx" ON "character_snapshots"("character_id");

-- CreateIndex
CREATE UNIQUE INDEX "character_snapshots_character_id_version_key" ON "character_snapshots"("character_id", "version");

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "character_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_stats" ADD CONSTRAINT "character_stats_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_resources" ADD CONSTRAINT "character_resources_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_items" ADD CONSTRAINT "character_items_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_actions" ADD CONSTRAINT "character_actions_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_effects" ADD CONSTRAINT "character_effects_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_links" ADD CONSTRAINT "character_links_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_notes" ADD CONSTRAINT "character_notes_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_snapshots" ADD CONSTRAINT "character_snapshots_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
