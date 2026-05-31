export type CharacterOption = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export type AttributeKey = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export type AttributeBonuses = Partial<Record<AttributeKey, number>>;

export type CharacterBuilderState = {
  selectedRaceId: string | null;
  selectedClassId: string | null;
  baseAttributes: Record<AttributeKey, number>;
  raceBonuses: AttributeBonuses;
  classBonuses: AttributeBonuses;
  raceAccentColor: string | null;
  classAccentColor: string | null;
};
