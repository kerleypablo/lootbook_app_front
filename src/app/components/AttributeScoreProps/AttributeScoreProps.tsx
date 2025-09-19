"use client";

import { useMemo } from "react";
import type { AttributeKey } from "@/features/character-builder/types";
import styles from "../css/AttributeScore.module.css";

type AttributeBonusBreakdown = Record<string, number>;

type AttributeScoreProps = {
  id: AttributeKey;
  label: string;
  base: number;
  bonuses?: AttributeBonusBreakdown;
  min?: number;
  max?: number;
  disableIncrement?: boolean;
  disableDecrement?: boolean;
  onChange: (nextBase: number) => void;
  showBonusChip?: boolean;
  scale?: number;
};

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 20;

export default function AttributeScore({
  id,
  label,
  base,
  bonuses = {},
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  disableIncrement,
  disableDecrement,
  onChange,
  showBonusChip = true,
  scale = 1.16,
}: AttributeScoreProps) {
  const bonusSum = useMemo(
    () =>
      Object.values(bonuses).reduce<number>((acc, value = 0) => acc + value, 0),
    [bonuses],
  );

  const total = base + bonusSum;
  const modifier = Math.floor((total - 10) / 2);
  const format = (value: number) => (value > 0 ? `+${value}` : `${value}`);

  const increment = () => {
    if (disableIncrement) {
      return;
    }
    const next = Math.min(base + 1, max);
    if (next !== base) {
      onChange(next);
    }
  };

  const decrement = () => {
    if (disableDecrement) {
      return;
    }
    const next = Math.max(base - 1, min);
    if (next !== base) {
      onChange(next);
    }
  };

  return (
    <div className={styles.card} style={{ transform: `scale(${scale})` }}>
      <div className={styles.title}>{label}</div>

      <div className={styles.row}>
        <div className={styles.circle}>
          <div className={styles.value}>{base}</div>

          {showBonusChip && bonusSum !== 0 && (
            <div className={styles.bonusChip}>{format(bonusSum)}</div>
          )}
        </div>

        <div className="text-zinc-400">{">"}</div>

        <div className={styles.circle}>
          <div className={styles.modLabel}>mod</div>
          <div className={styles.value}>{format(modifier)}</div>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            onClick={increment}
            disabled={disableIncrement || base >= max}
            className={styles.btn}
            aria-label={`Increment ${id}`}
            title="Aumentar"
          >
            +
          </button>
          <button
            type="button"
            onClick={decrement}
            disabled={disableDecrement || base <= min}
            className={styles.btn}
            aria-label={`Decrement ${id}`}
            title="Diminuir"
          >
            -
          </button>
        </div>
      </div>
    </div>
  );
}
