"use client";

import { useStepAvailability } from "@/features/character-builder/hooks/useStepAvailability";
import { useCharacterBuilder } from "@/features/character-builder/state/CharacterBuilderContext";

const BACKGROUNDS = ["Adventurer", "Scholar", "Soldier", "Outlander"];

export default function BackgroundPage() {
  const { background, setBackground } = useCharacterBuilder();
  useStepAvailability(Boolean(background));

  return (
    <div className="mx-auto max-w-xl px-6 pt-8 text-white">
      <h1 className="text-2xl font-semibold">Background</h1>
      <p className="mt-2 text-sm text-slate-300">Selecao temporaria para testar a criacao.</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {BACKGROUNDS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setBackground(item)}
            className={`rounded-xl border px-4 py-5 text-left ${background === item ? "border-cyan-300 bg-cyan-300/15" : "border-white/15 bg-white/5"}`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
