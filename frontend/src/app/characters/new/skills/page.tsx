"use client";

import { useStepAvailability } from "@/features/character-builder/hooks/useStepAvailability";
import { useCharacterBuilder } from "@/features/character-builder/state/CharacterBuilderContext";

const SKILLS = ["Athletics", "Arcana", "History", "Perception", "Stealth", "Survival"];

export default function SkillsPage() {
  const { characterName, selectedSkills, setCharacterName, toggleSkill } = useCharacterBuilder();
  useStepAvailability(Boolean(characterName.trim()));

  return (
    <div className="mx-auto max-w-xl px-6 pt-8 text-white">
      <h1 className="text-2xl font-semibold">Skills</h1>
      <p className="mt-2 text-sm text-slate-300">Tela temporaria para concluir o teste de criacao.</p>
      <label className="mt-6 block text-sm font-medium" htmlFor="character-name">Nome do personagem</label>
      <input
        id="character-name"
        value={characterName}
        onChange={(event) => setCharacterName(event.target.value)}
        maxLength={120}
        placeholder="Ex.: Arin da Floresta"
        className="mt-2 w-full rounded-lg border border-white/20 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300"
      />
      <p className="mt-6 text-sm font-medium">Habilidades (opcional)</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SKILLS.map((skill) => {
          const selected = selectedSkills.includes(skill);
          return (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`rounded-full border px-4 py-2 text-sm ${selected ? "border-cyan-300 bg-cyan-300/15" : "border-white/15 bg-white/5"}`}
            >
              {skill}
            </button>
          );
        })}
      </div>
    </div>
  );
}
