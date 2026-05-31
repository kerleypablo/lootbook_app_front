"use client";

import OptionSelectionList from "@/features/character-builder/components/OptionSelectionList";
import { RACES } from "@/features/character-builder/data/races";
import { useSelectionHighlight } from "@/features/character-builder/hooks/useSelectionHighlight";
import { useStepAvailability } from "@/features/character-builder/hooks/useStepAvailability";
import { useCharacterBuilder } from "@/features/character-builder/state/CharacterBuilderContext";

export default function RacePage() {
  const { selectedRaceId, selectRace, raceAccentColor } = useCharacterBuilder();
  const { handleSelect, highlightColor, selectedRef, shadowTop } =
    useSelectionHighlight({
      selectedId: selectedRaceId,
      storedAccentColor: raceAccentColor,
      onSelect: selectRace,
    });

  useStepAvailability(Boolean(selectedRaceId));

  return (
    <OptionSelectionList
      items={RACES}
      selectedId={selectedRaceId}
      highlightColor={highlightColor}
      shadowTop={shadowTop}
      selectedRef={selectedRef}
      onSelect={handleSelect}
    />
  );
}
