import { CLASSES } from "../data/classes";
import { RACES } from "../data/races";
import type { AttributeKey, CharacterBuilderState } from "../types";

const API_BASE_URL = "/api/lootbook";

const ATTRIBUTE_API_KEYS: Record<AttributeKey, string> = {
  STR: "strength",
  DEX: "dexterity",
  CON: "constitution",
  INT: "intelligence",
  WIS: "wisdom",
  CHA: "charisma",
};

const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  STR: "Strength",
  DEX: "Dexterity",
  CON: "Constitution",
  INT: "Intelligence",
  WIS: "Wisdom",
  CHA: "Charisma",
};

type CreatedCharacterResponse = { character: { id: string } };

class ApiRequestError extends Error {
  constructor(message: string, readonly status: number, readonly responseBody: unknown) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch (error) {
    console.error("Lootbook API network error", { path, error });
    throw new Error("Nao foi possivel conectar ao backend.");
  }

  const responseBody: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("Lootbook API request failed", {
      path,
      method: init?.method ?? "GET",
      status: response.status,
      responseBody,
    });
    throw new ApiRequestError("O backend recusou a solicitacao.", response.status, responseBody);
  }

  return responseBody as T;
}

export async function createCharacterFromBuilder(state: CharacterBuilderState) {
  const race = RACES.find((item) => item.id === state.selectedRaceId);
  const characterClass = CLASSES.find((item) => item.id === state.selectedClassId);

  if (!race || !characterClass || !state.characterName.trim()) {
    console.error("Invalid builder state before save", { state });
    throw new Error("Preencha o nome, raca e classe antes de salvar.");
  }

  const created = await requestJson<CreatedCharacterResponse>("/characters", {
    method: "POST",
    body: JSON.stringify({
      name: state.characterName.trim(),
      level: 1,
      summaryJson: {
        identity: {
          race: { id: race.id, name: race.name },
          class: { id: characterClass.id, name: characterClass.name },
        },
        background: state.background,
        skills: state.selectedSkills,
      },
    }),
  });

  const stats = (Object.keys(state.baseAttributes) as AttributeKey[]).map((key) => {
    const raceBonus = state.raceBonuses[key] ?? 0;
    const classBonus = state.classBonuses[key] ?? 0;
    const baseValue = state.baseAttributes[key];

    return {
      key: ATTRIBUTE_API_KEYS[key],
      label: ATTRIBUTE_LABELS[key],
      baseValue,
      currentValue: baseValue + raceBonus + classBonus,
      maxValue: null,
      metaJson: { raceBonus, classBonus },
    };
  });

  try {
    await requestJson(`/characters/${created.character.id}/stats`, {
      method: "PUT",
      body: JSON.stringify({ stats }),
    });
  } catch (error) {
    console.error("Character was created but stats could not be saved", {
      characterId: created.character.id,
      error,
    });
    throw new Error("Personagem criado, mas os atributos nao foram salvos. Tente editar depois.");
  }

  return created.character;
}

export { ApiRequestError };
