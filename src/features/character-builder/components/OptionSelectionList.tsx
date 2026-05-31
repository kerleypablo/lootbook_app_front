"use client";

import type { CharacterOption } from "@/features/character-builder/types";
import OptionCard from "./OptionCard";
import SelectionHighlight from "./SelectionHighlight";

type OptionSelectionListProps = {
  items: CharacterOption[];
  selectedId: string | null;
  highlightColor: string | null | undefined;
  shadowTop: number;
  selectedRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (id: string, accentColor?: string) => void;
};

export default function OptionSelectionList({
  items,
  selectedId,
  highlightColor,
  shadowTop,
  selectedRef,
  onSelect,
}: OptionSelectionListProps) {
  return (
    <div className="h-full overflow-y-auto px-4 text-white relative">
      {selectedId && highlightColor && (
        <SelectionHighlight color={highlightColor} top={shadowTop} />
      )}

      {items.map((item) => {
        const isSelected = selectedId === item.id;
        const cardAccent = isSelected ? highlightColor ?? undefined : undefined;

        return (
          <OptionCard
            key={item.id}
            id={item.id}
            name={item.name}
            description={item.description}
            image={item.image}
            selected={isSelected}
            accentColor={cardAccent}
            onSelect={onSelect}
            innerRef={isSelected ? selectedRef : undefined}
          />
        );
      })}
    </div>
  );
}
