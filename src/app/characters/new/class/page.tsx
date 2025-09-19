"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ClassCard from "../../../components/cards/ClassCard";
import { CLASSES } from "@/features/character-builder/data/classes";
import { useCharacterBuilder } from "@/features/character-builder/state/CharacterBuilderContext";
import { useStepNavigation } from "../StepNavigationContext";

export default function ClassPage() {
  const { selectedClassId, selectClass, classAccentColor } = useCharacterBuilder();
  const [accentColor, setAccentColor] = useState<string | null>(classAccentColor);
  const selectedRef = useRef<HTMLDivElement>(null);
  const [shadowTop, setShadowTop] = useState<number>(0);
  const { setIsNextEnabled } = useStepNavigation();

  useEffect(() => {
    setAccentColor(classAccentColor ?? null);
  }, [classAccentColor]);

  useEffect(() => {
    if (selectedRef.current) {
      setShadowTop(selectedRef.current.offsetTop);
    }
  }, [selectedClassId]);

  const handleSelect = (id: string, color?: string) => {
    selectClass(id, color ?? null);
    if (color) {
      setAccentColor(color);
    }
  };

  useEffect(() => {
    setIsNextEnabled(Boolean(selectedClassId));
  }, [selectedClassId, setIsNextEnabled]);

  const highlightColor = useMemo(() => accentColor ?? classAccentColor, [accentColor, classAccentColor]);

  return (
    <div className="h-full overflow-y-auto px-4 text-white relative">
      {selectedClassId && highlightColor && (
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

      {CLASSES.map((cls) => {
        const isSelected = selectedClassId === cls.id;
        const cardAccent = isSelected ? highlightColor ?? undefined : undefined;
        return (
          <ClassCard
            key={cls.id}
            id={cls.id}
            name={cls.name}
            description={cls.description}
            image={cls.image}
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
