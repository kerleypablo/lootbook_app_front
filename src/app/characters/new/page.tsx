"use client";
import React, { useState } from "react";
import ClassCard from "./../../components/ClassCard";
import NavigationNewCharacter from "./../../components/NavigationNewCharacter";

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
    description: "Natural magic and wild shapes",
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
    description: "Divine Warrior",
    image: "/images/classImages/paladin.png",
  },
       {
    id: "Monk",
    name: "MONK",
    description: "Divine Warrior",
    image: "/images/classImages/monk.png",
  },
         {
    id: "Artificer",
    name: "ARTIFICER",
    description: "Divine Warrior",
    image: "/images/classImages/Artificer.png",
  },
           {
    id: "Bard",
    name: "BARD",
    description: "Divine Warrior",
    image: "/images/classImages/Bard.png",
  },
             {
    id: "Ranger",
    name: "RANGER",
    description: "Divine Warrior",
    image: "/images/classImages/Ranger.png",
  },
];

export default function NewCharacterPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="px-4 py-6 flex flex-col gap-4">
          <NavigationNewCharacter />

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
  );
}