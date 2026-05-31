"use client";

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CLASS_ATTRIBUTE_BONUSES, RACE_ATTRIBUTE_BONUSES } from '../data/bonuses';
import type {
  AttributeBonuses,
  AttributeKey,
  CharacterBuilderState,
} from '../types';

const DEFAULT_BASE_ATTRIBUTES: Record<AttributeKey, number> = {
  STR: 10,
  DEX: 10,
  CON: 10,
  INT: 10,
  WIS: 10,
  CHA: 10,
};

type CharacterBuilderActions = {
  selectRace: (id: string | null, accentColor?: string | null) => void;
  selectClass: (id: string | null, accentColor?: string | null) => void;
  updateBaseAttribute: (key: AttributeKey, value: number) => void;
  reset: () => void;
};

type CharacterBuilderContextValue = CharacterBuilderState &
  CharacterBuilderActions & {
    getCombinedBonuses: (
      key: AttributeKey,
    ) => { race: number; class: number; total: number };
  };

const CharacterBuilderContext =
  createContext<CharacterBuilderContextValue | undefined>(undefined);

function resolveBonuses(
  source: Record<string, AttributeBonuses>,
  id: string | null,
): AttributeBonuses {
  if (!id) {
    return {};
  }
  return source[id] ?? {};
}

export function CharacterBuilderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<CharacterBuilderState>(() => ({
    selectedRaceId: null,
    selectedClassId: null,
    baseAttributes: { ...DEFAULT_BASE_ATTRIBUTES },
    raceBonuses: {},
    classBonuses: {},
    raceAccentColor: null,
    classAccentColor: null,
  }));

  const selectRace = useCallback((id: string | null, accentColor?: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedRaceId: id,
      raceBonuses: resolveBonuses(RACE_ATTRIBUTE_BONUSES, id),
      raceAccentColor:
        id === null
          ? null
          : accentColor ?? (prev.selectedRaceId === id ? prev.raceAccentColor : null),
    }));
  }, []);

  const selectClass = useCallback((id: string | null, accentColor?: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedClassId: id,
      classBonuses: resolveBonuses(CLASS_ATTRIBUTE_BONUSES, id),
      classAccentColor:
        id === null
          ? null
          : accentColor ?? (prev.selectedClassId === id ? prev.classAccentColor : null),
    }));
  }, []);

  const updateBaseAttribute = useCallback((key: AttributeKey, value: number) => {
    setState((prev) => ({
      ...prev,
      baseAttributes: { ...prev.baseAttributes, [key]: value },
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      selectedRaceId: null,
      selectedClassId: null,
      baseAttributes: { ...DEFAULT_BASE_ATTRIBUTES },
      raceBonuses: {},
      classBonuses: {},
      raceAccentColor: null,
      classAccentColor: null,
    });
  }, []);

  const getCombinedBonuses = useCallback(
    (key: AttributeKey) => {
      const race = state.raceBonuses[key] ?? 0;
      const cls = state.classBonuses[key] ?? 0;
      return { race, class: cls, total: race + cls };
    },
    [state.classBonuses, state.raceBonuses],
  );

  const value = useMemo<CharacterBuilderContextValue>(() => ({
    ...state,
    selectRace,
    selectClass,
    updateBaseAttribute,
    reset,
    getCombinedBonuses,
  }), [state, selectRace, selectClass, updateBaseAttribute, reset, getCombinedBonuses]);

  return (
    <CharacterBuilderContext.Provider value={value}>
      {children}
    </CharacterBuilderContext.Provider>
  );
}

export function useCharacterBuilder() {
  const context = useContext(CharacterBuilderContext);
  if (!context) {
    throw new Error(
      'useCharacterBuilder must be used within a CharacterBuilderProvider',
    );
  }
  return context;
}
