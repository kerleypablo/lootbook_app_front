"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import NavigationNewCharacter from "../../../components/navigation/NavigationNewCharacter";
import StepNavigation from "../../../components/navigation/StepNavigation";
import AttributeScore, { type AttributeKey } from "../../../components/AttributeScoreProps/AttributeScoreProps";

export default function AttributesPage() {
  // ----- (1) estado base dos atributos (o que o usuário altera com + e -)
  const [baseScores, setBaseScores] = useState<Record<AttributeKey, number>>({
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10,
  });

  // ----- (2) bônus vindos da raça/classe/… (aqui mock; plugue no teu estado global/contexto)
  // Ex.: se a raça escolhida for +2 STR e +1 CON, faça:
  const raceBonuses: Partial<Record<AttributeKey, number>> = { STR: 2, CON: 1 };
  const classBonuses: Partial<Record<AttributeKey, number>> = {}; // geralmente 0

  // helper para combinar bônus por atributo (pode somar mais fontes: feat/item/temp)
  const getBonusesFor = (k: AttributeKey) => ({
    race: raceBonuses[k] ?? 0,
    class: classBonuses[k] ?? 0,
  });

  // ----- (3) point-buy opcional (exibimos pontos restantes só p/ feedback)
  const ALL: AttributeKey[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
  const pointsMax = 27;
  const pointsSpent = useMemo(() => {
    // custo padrão (assumindo base mínima 8); ajuste se quiser outra regra
    const costTable: Record<number, number> = {
      8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
    };
    return ALL.reduce((acc, k) => acc + (costTable[baseScores[k]] ?? 0), 0);
  }, [baseScores]);
  const pointsRemaining = Math.max(0, pointsMax - pointsSpent);

  // ----- (4) handlers + layout existente (mantive tua estrutura de header/footer)
  const [accentColor, setAccentColor] = useState<string>("#00ffe0");
  const selectedRef = useRef<HTMLDivElement>(null!);
  const [shadowTop, setShadowTop] = useState<number>(0);

  useEffect(() => {
    if (selectedRef.current) {
      setShadowTop(selectedRef.current.offsetTop);
    }
  }, []);

  const handleChange = (key: AttributeKey, nextBase: number) => {
    setBaseScores((s) => ({ ...s, [key]: nextBase }));
  };

  return (
    <div
      className="relative h-full flex flex-col bg-gray-900 text-white"
      data-accent={accentColor}
      data-shadow-top={shadowTop}
      data-has-setaccent={Boolean(setAccentColor)}
      >
      <div className="flex-shrink-0 z-40 px-4 pt-4">
        <NavigationNewCharacter />
      </div>

      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-20 relative">
        <div className="relative z-10 max-w-[720px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
            {ALL.map((k) => (
              <AttributeScore
                key={k}
                id={k}
                label={{
                  STR: "Strength",
                  DEX: "Dexterity",
                  CON: "Constitution",
                  INT: "Intelligence",
                  WIS: "Wisdom",
                  CHA: "Charisma",
                }[k]}
                base={baseScores[k]}
                bonuses={getBonusesFor(k)}
                min={8}
                max={15}
                disableIncrement={pointsRemaining <= 0}
                onChange={(n) => handleChange(k, n)}
                showBonusChip
              />
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full px-4 py-4 bg-gray-900 border-t border-gray-800 z-50">
        {/* habilite "Próximo" quando sua validação de atributos estiver ok */}
        <StepNavigation isNextEnabled={true} />
      </div>
    </div>
  );
}
