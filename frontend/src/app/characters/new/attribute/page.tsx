"use client";

import AttributeScore from "@/features/character-builder/components/AttributeScore";
import { usePointBuy } from "@/features/character-builder/hooks/usePointBuy";
import { useStepAvailability } from "@/features/character-builder/hooks/useStepAvailability";
import { useCharacterBuilder } from "@/features/character-builder/state/CharacterBuilderContext";
import type { AttributeKey } from "@/features/character-builder/types";

const ALL: AttributeKey[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  STR: "Strength",
  DEX: "Dexterity",
  CON: "Constitution",
  INT: "Intelligence",
  WIS: "Wisdom",
  CHA: "Charisma",
};

export default function AttributesPage() {
  const { baseAttributes, updateBaseAttribute, getCombinedBonuses } =
    useCharacterBuilder();
  const { pointsRemaining } = usePointBuy(baseAttributes);

  useStepAvailability(true);

  return (
    <div className="h-full overflow-y-auto px-4 text-white">
      <div className="relative z-10 max-w-[720px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
          {ALL.map((key) => {
            const { race, class: classBonus } = getCombinedBonuses(key);

            return (
              <AttributeScore
                key={key}
                id={key}
                label={ATTRIBUTE_LABELS[key]}
                base={baseAttributes[key]}
                bonuses={{ race, class: classBonus }}
                min={0}
                max={20}
                disableIncrement={pointsRemaining <= 0}
                onChange={(value) => updateBaseAttribute(key, value)}
                showBonusChip
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
