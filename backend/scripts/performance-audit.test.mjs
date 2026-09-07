import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const backendRoot = resolve(import.meta.dirname, "..");

async function read(relativePath) {
  return readFile(resolve(backendRoot, relativePath), "utf8");
}

test("schema keeps indexes for every character-owned relation", async () => {
  const schema = await read("prisma/schema.prisma");
  const requiredIndexes = [
    "characters_user_id_idx",
    "characters_template_id_idx",
    "character_stats_character_id_idx",
    "character_resources_character_id_idx",
    "character_items_character_id_idx",
    "character_actions_character_id_idx",
    "character_effects_character_id_idx",
    "character_links_character_id_idx",
    "character_notes_character_id_idx",
    "character_snapshots_character_id_idx",
    "character_stats_character_id_key_key",
    "character_resources_character_id_key_key",
    "character_snapshots_character_id_version_key",
  ];

  for (const indexName of requiredIndexes) {
    assert.match(schema, new RegExp(`map: "${indexName}"`));
  }
});

test("critical reads select only required data and bound snapshot history", async () => {
  const [sheetRepository, calculationRepository] = await Promise.all([
    read("src/modules/snapshots/repository.ts"),
    read("src/modules/links/repository.ts"),
  ]);

  assert.match(sheetRepository, /snapshots:\s*\{\s*take:\s*1,/);
  assert.match(sheetRepository, /select:\s*\{/);
  assert.match(calculationRepository, /select:\s*\{\s*id:\s*true,/);
  assert.doesNotMatch(sheetRepository, /findMany\(\s*\)/);
  assert.doesNotMatch(calculationRepository, /\$queryRaw|\$executeRaw/);
});
