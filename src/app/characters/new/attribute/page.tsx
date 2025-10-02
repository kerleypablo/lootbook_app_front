"use client";

import { useEffect, useMemo } from "react";
import AttributeScore from "../../../components/AttributeScoreProps/AttributeScoreProps";
import { useCharacterBuilder } from "@/features/character-builder/state/CharacterBuilderContext";
import type { AttributeKey } from "@/features/character-builder/types";
import { useStepNavigation } from "../StepNavigationContext";

const ALL: AttributeKey[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

export default function AttributesPage() {
  const { baseAttributes, updateBaseAttribute, getCombinedBonuses } =
    useCharacterBuilder();
  const { setIsNextEnabled } = useStepNavigation();

  const pointsMax = 27;
  const pointsSpent = useMemo(() => {
    const costTable: Record<number, number> = {
      8: 0,
      9: 1,
      10: 2,
      11: 3,
      12: 4,
      13: 5,
      14: 7,
      15: 9,
    };
    return ALL.reduce((acc, key) => acc + (costTable[baseAttributes[key]] ?? 0), 0);
  }, [baseAttributes]);
  const pointsRemaining = Math.max(0, pointsMax - pointsSpent);

  useEffect(() => {
    setIsNextEnabled(true);
  }, [setIsNextEnabled]);

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
                label={{
                  STR: "Strength",
                  DEX: "Dexterity",
                  CON: "Constitution",
                  INT: "Intelligence",
                  WIS: "Wisdom",
                  CHA: "Charisma",
                }[key]}
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
