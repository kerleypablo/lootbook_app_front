import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const moduleRoot = resolve(import.meta.dirname, "../src/modules");

async function source(module, file) {
  return readFile(resolve(moduleRoot, module, file), "utf8");
}

test("all character-data routes require authenticated context", async () => {
  const protectedModules = [
    "auth", "users", "characters", "stats", "resources", "items",
    "actions", "effects", "links", "notes", "snapshots",
  ];

  for (const module of protectedModules) {
    const routeSource = await source(module, "route.ts");
    assert.match(routeSource, /preHandler:\s*app\.authenticate/, `${module} route must require authentication`);
  }

  const templateRoutes = await source("templates", "route.ts");
  assert.doesNotMatch(templateRoutes, /preHandler:\s*app\.authenticate/);
});

test("every repository that reads or mutates character data retains an ownership predicate", async () => {
  const requiredPredicates = {
    characters: [/id:\s*characterId,[\s\S]{0,80}userId/, /id:\s*characterId,[\s\S]{0,80}userId/],
    stats: [/id:\s*characterId,[\s\S]{0,80}userId/],
    resources: [/id:\s*characterId,[\s\S]{0,80}userId/],
    notes: [/id:\s*characterId,[\s\S]{0,80}userId/],
    items: [/id:\s*characterId,\s*userId/, /character:\s*\{\s*userId\s*\}/],
    actions: [/id:\s*characterId,\s*userId/, /character:\s*\{\s*userId\s*\}/],
    effects: [/id:\s*characterId,\s*userId/, /character:\s*\{\s*userId\s*\}/],
    links: [/id:\s*characterId,\s*userId/, /id:\s*characterId,[\s\S]{0,80}userId/, /character:\s*\{\s*userId\s*\}/],
    snapshots: [/id:\s*characterId,\s*userId/],
  };

  for (const [module, predicates] of Object.entries(requiredPredicates)) {
    const repositorySource = await source(module, "repository.ts");
    for (const predicate of predicates) {
      assert.match(repositorySource, predicate, `${module} repository is missing an ownership predicate`);
    }
  }
});
