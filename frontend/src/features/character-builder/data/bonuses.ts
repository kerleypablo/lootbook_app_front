import type { AttributeBonuses } from '../types';

export const RACE_ATTRIBUTE_BONUSES: Record<string, AttributeBonuses> = {
  human: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
  dwarf: { CON: 2 },
  elf: { DEX: 2 },
  dragonborn: { STR: 2, CHA: 1 },
  tiefling: { CHA: 2 },
  'half-orc': { STR: 2, CON: 1 },
  'half-elf': { CHA: 2, STR: 1, DEX: 1 },
  halfling: { DEX: 2 },
};

export const CLASS_ATTRIBUTE_BONUSES: Record<string, AttributeBonuses> = {
  wizard: { INT: 2 },
  fighter: { STR: 2, CON: 1 },
  cleric: { WIS: 2 },
  rogue: { DEX: 2 },
  druid: { WIS: 2 },
  sorcerer: { CHA: 2 },
  warlock: { CHA: 2 },
  paladin: { STR: 1, CHA: 1 },
  monk: { DEX: 1, WIS: 1 },
  artificer: { INT: 2 },
  bard: { CHA: 2 },
  ranger: { DEX: 2, WIS: 1 },
};
