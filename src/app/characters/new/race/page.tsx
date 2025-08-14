"use client";
import React, { useState, useRef, useEffect } from "react";
import ClassCard from "../../../components/cards/ClassCard";
import { useStepNavigation } from "../StepNavigationContext";

const RACES = [
  { id: "wizard", name: "WIZARD", description: "Masters of arcane power", image: "/images/raceImages/wizard.png" },
  { id: "fighter", name: "FIGHTER", description: "Brave in Melee Combat", image: "/images/raceImages/fighter.png" },
  { id: "cleric", name: "CLERIC", description: "Divine magic and healing", image: "/images/raceImages/cleric.png" },
  { id: "rogue", name: "ROGUE", description: "Stealthy and cunning", image: "/images/raceImages/rogue.png" },
  { id: "druid", name: "DRUID", description: "Natural magic and wild shapes", image: "/images/raceImages/druid.png" },
  { id: "Sorcerer", name: "SORCERER", description: "Innate magical talent", image: "/images/raceImages/sorcerer.png" },
  { id: "Warlock", name: "WARLOCK", description: "Pact magic and summoning", image: "/images/raceImages/warlock.png" },
  { id: "Paladin", name: "PALADIN", description: "Holy warrior bound by oath", image: "/images/raceImages/paladin.png" },
  { id: "Monk", name: "MONK", description: "Master of martial arts", image: "/images/raceImages/monk.png" },
  { id: "Artificer", name: "ARTIFICER", description: "Inventive magical crafter", image: "/images/raceImages/Artificer.png" },
  { id: "Bard", name: "BARD", description: "Musical spellcaster and support", image: "/images/raceImages/Bard.png" },
  { id: "Ranger", name: "RANGER", description: "Wilderness hunter and scout", image: "/images/raceImages/Ranger.png" },
];

export default function RacePage() {
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

      {RACES.map((cls, index) => {
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
