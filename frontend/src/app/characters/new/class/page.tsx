"use client";

import OptionSelectionList from "@/features/character-builder/components/OptionSelectionList";
import { CLASSES } from "@/features/character-builder/data/classes";
import { useSelectionHighlight } from "@/features/character-builder/hooks/useSelectionHighlight";
import { useStepAvailability } from "@/features/character-builder/hooks/useStepAvailability";
import { useCharacterBuilder } from "@/features/character-builder/state/CharacterBuilderContext";

export default function ClassPage() {
  const { selectedClassId, selectClass, classAccentColor } = useCharacterBuilder();
  const { handleSelect, highlightColor, selectedRef, shadowTop } =
    useSelectionHighlight({
      selectedId: selectedClassId,
      storedAccentColor: classAccentColor,
      onSelect: selectClass,
    });

  useStepAvailability(Boolean(selectedClassId));

  return (
    <OptionSelectionList
      items={CLASSES}
      selectedId={selectedClassId}
      highlightColor={highlightColor}
      shadowTop={shadowTop}
      selectedRef={selectedRef}
      onSelect={handleSelect}
    />
  );
}
