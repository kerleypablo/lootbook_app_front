"use client";
import React, { useState } from "react";
import ClassCard from "../../../components/cards/ClassCard";
import NavigationNewCharacter from "../../../components/navigation/NavigationNewCharacter";
import StepNavigation from "../../../components/navigation/StepNavigation";

const CLASSES = [
  {
    id: "wizard",
    name: "WIZARD",
    description: "Masters of arcane power",
    image: "/images/classImages/wizard.png",
  },
  {
    id: "fighter",
    name: "FIGHTER",
    description: "Brave in Melee Combat",
    image: "/images/classImages/fighter.png",
  },
  {
    id: "cleric",
    name: "CLERIC",
    description: "Divine magic and healing",
    image: "/images/classImages/cleric.png",
  },
  {
    id: "rogue",
    name: "ROGUE",
    description: "Stealthy and cunning",
    image: "/images/classImages/rogue.png",
  },
  {
    id: "druid",
    name: "DRUID",
    description: "Natural magic and wild shapes",
    image: "/images/classImages/druid.png",
  },
  {
    id: "Sorcerer",
    name: "SORCERER",
    description: "Innate magical talent",
    image: "/images/classImages/sorcerer.png",
  },
  {
    id: "Warlock",
    name: "WARLOCK",
    description: "Pact magic and summoning",
    image: "/images/classImages/warlock.png",
  },
  {
    id: "Paladin",
    name: "PALADIN",
    description: "Holy warrior bound by oath",
    image: "/images/classImages/paladin.png",
  },
  {
    id: "Monk",
    name: "MONK",
    description: "Master of martial arts",
    image: "/images/classImages/monk.png",
  },
  {
    id: "Artificer",
    name: "ARTIFICER",
    description: "Inventive magical crafter",
    image: "/images/classImages/Artificer.png",
  },
  {
    id: "Bard",
    name: "BARD",
    description: "Musical spellcaster and support",
    image: "/images/classImages/Bard.png",
  },
  {
    id: "Ranger",
    name: "RANGER",
    description: "Wilderness hunter and scout",
    image: "/images/classImages/Ranger.png",
  },
];


export default function RacePage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="relative h-full flex flex-col">
      {/* Navegação fixa logo abaixo do Header */}
      <div className="flex-shrink-0 z-40 bg-gray-900 px-4 pt-4">
        <NavigationNewCharacter />
      </div>

      {/* Lista de classes com scroll interno */}
      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-20">
        {CLASSES.map((cls) => (
          <ClassCard
            key={cls.id}
            id={cls.id}
            name={cls.name}
            description={cls.description}
            image={cls.image}
            selected={selected === cls.id}
            onSelect={(id) => setSelected(id)}
          />
        ))}
      </div>

      {/* Botão fixo no rodapé */}
      <div className="fixed bottom-0 left-0 w-full px-4 py-4 bg-gray-900 border-t border-gray-800 z-50">
        <StepNavigation isNextEnabled={!!selected} />
      </div>
    </div>
  );
}