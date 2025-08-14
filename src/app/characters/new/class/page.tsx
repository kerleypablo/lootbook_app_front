"use client";
import React, { useState, useRef, useEffect } from "react";
import ClassCard from "../../../components/cards/ClassCard";
import { useStepNavigation } from "../StepNavigationContext";

const CLASSES = [
  { id: "Human", name: "HUMAN", description: "All ability scores +1", image: "/images/classImages/Human.png" },
  { id: "Dwarf", name: "DWARF", description: "Constitution +2", image: "/images/classImages/dwarf.png" },
  { id: "Elf", name: "ELF", description: "Dexterity +2", image: "/images/classImages/elf.png" },
  { id: "Dragonborn", name: "DRAGONBORN", description: "Strength +2 Charisma +1", image: "/images/classImages/dragonborn.png" },
  { id: "Tiefling", name: "TIELFLING", description: "Charisma +2", image: "/images/classImages/Tiefling.png" },
  { id: "Half-Orc", name: "HALF-ORC", description: "Strength +2 Constitution +1", image: "/images/classImages/sorcerer.png" },
  { id: "Half-Elf", name: "HALF-ELF", description: "Charisma +2 Two ability scores +1", image: "/images/classImages/half-elf.png" },
  { id: "HalfLING", name: "HALFLING", description: "Dexterity +2", image: "/images/classImages/halfling.png" },
];

export default function ClassPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState<string>("#00ffe0");
  const selectedRef = useRef<HTMLDivElement>(null!);
  const [shadowTop, setShadowTop] = useState<number>(0);
  const { setIsNextEnabled } = useStepNavigation();

  useEffect(() => {
    if (selectedRef.current) {
      const top = selectedRef.current.offsetTop;
      setShadowTop(top);
    }
  }, [selectedId]);

  const handleSelect = (id: string, _: number, color?: string) => {
    setSelectedId(id);
    if (color) setAccentColor(color);
  };

  useEffect(() => {
    setIsNextEnabled(!!selectedId);
  }, [selectedId, setIsNextEnabled]);

  return (
    <div className="h-full overflow-y-auto px-4 text-white relative">
      {selectedId && (
        <div
          className="absolute left-0 w-full z-0 transition-all duration-500 ease-in-out pointer-events-none"
          style={{
            height: "150px",
            top: `${shadowTop - 15}px`,
            backgroundColor: accentColor,
            borderRadius: "10px",
            filter: "blur(30px)",
            opacity: 1.8,
          }}
        />
      )}

      {CLASSES.map((cls, index) => {
        const isSelected = selectedId === cls.id;
        return (
          <ClassCard
            key={cls.id}
            id={cls.id}
            name={cls.name}
            description={cls.description}
            image={cls.image}
            selected={isSelected}
            accentColor={isSelected ? accentColor : undefined}
            onSelect={(id, color) => handleSelect(id, index, color)}
            innerRef={isSelected ? selectedRef : undefined}
          />
        );
      })}
    </div>
  );
}
