"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ClassCard from "../../../components/cards/ClassCard";
import { useCharacterBuilder } from "@/features/character-builder/state/CharacterBuilderContext";
import { RACES } from "@/features/character-builder/data/races";
import { useStepNavigation } from "../StepNavigationContext";

export default function RacePage() {
  const { selectedRaceId, selectRace, raceAccentColor } = useCharacterBuilder();
  const [accentColor, setAccentColor] = useState<string | null>(raceAccentColor);
  const selectedRef = useRef<HTMLDivElement>(null);
  const [shadowTop, setShadowTop] = useState<number>(0);
  const { setIsNextEnabled } = useStepNavigation();

  useEffect(() => {
    setAccentColor(raceAccentColor ?? null);
  }, [raceAccentColor]);

  useEffect(() => {
    if (selectedRef.current) {
      setShadowTop(selectedRef.current.offsetTop);
    }
  }, [selectedRaceId]);

  const handleSelect = (id: string, color?: string) => {
    selectRace(id, color ?? null);
    if (color) {
      setAccentColor(color);
    }
  };

  useEffect(() => {
    setIsNextEnabled(Boolean(selectedRaceId));
  }, [selectedRaceId, setIsNextEnabled]);

  const highlightColor = useMemo(() => accentColor ?? raceAccentColor, [accentColor, raceAccentColor]);

  return (
    <div className="h-full overflow-y-auto px-4 text-white relative">
      {selectedRaceId && highlightColor && (
        <div
          className="absolute left-0 w-full z-0 transition-all duration-500 ease-in-out pointer-events-none"
          style={{
            height: "150px",
            top: `${shadowTop - 15}px`,
            backgroundColor: highlightColor,
            borderRadius: "10px",
            filter: "blur(30px)",
            opacity: 1.8,
          }}
        />
      )}

      {RACES.map((race) => {
        const isSelected = selectedRaceId === race.id;
        const cardAccent = isSelected ? highlightColor ?? undefined : undefined;
        return (
          <ClassCard
            key={race.id}
            id={race.id}
            name={race.name}
            description={race.description}
            image={race.image}
            selected={isSelected}
            accentColor={cardAccent}
            onSelect={(id, color) => handleSelect(id, color)}
            innerRef={isSelected ? selectedRef : undefined}
          />
        );
      })}
    </div>
  );
}
