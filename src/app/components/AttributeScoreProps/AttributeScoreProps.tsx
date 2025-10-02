"use client";

import { useMemo } from "react";
import type { AttributeKey } from "@/features/character-builder/types";
import styles from "../css/AttributeScore.module.css";

type AttributeBonusBreakdown = Record<string, number | string | null | undefined>;

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

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const formatSigned = (value: number) => (value > 0 ? `+${value}` : `${value}`);

const abilityModifier = (score: number) => Math.floor((score - 10) / 2);

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
  const normalizedMin = useMemo(() => {
    if (!Number.isFinite(min)) {
      return DEFAULT_MIN;
    }
    const coerced = Math.trunc(Number(min));
    return clamp(coerced, DEFAULT_MIN, DEFAULT_MAX);
  }, [min]);

  const normalizedMax = useMemo(() => {
    if (!Number.isFinite(max)) {
      return DEFAULT_MAX;
    }
    const coerced = Math.trunc(Number(max));
    return clamp(coerced, normalizedMin, DEFAULT_MAX);
  }, [max, normalizedMin]);

  const { baseScore, bonusSum, totalScore, modifier } = useMemo(() => {
    const rawBase = Number.isFinite(base) ? Math.trunc(base) : normalizedMin;
    const baseScoreValue = clamp(rawBase, normalizedMin, normalizedMax);

    const computedBonusSum = Object.values(bonuses).reduce<number>((acc, rawValue) => {
      const numericValue = Number(rawValue ?? 0);
      if (!Number.isFinite(numericValue)) {
        return acc;
      }
      return acc + numericValue;
    }, 0);

    const rawTotal = baseScoreValue + computedBonusSum;
    const clampedTotal = clamp(rawTotal, DEFAULT_MIN, DEFAULT_MAX);

    return {
      baseScore: baseScoreValue,
      bonusSum: computedBonusSum,
      totalScore: clampedTotal,
      modifier: abilityModifier(clampedTotal),
    };
  }, [base, bonuses, normalizedMax, normalizedMin]);

  const upperBoundByTotal = Math.floor(DEFAULT_MAX - Math.max(0, bonusSum));
  const effectiveUpperBound = Math.max(
    normalizedMin,
    Math.min(normalizedMax, upperBoundByTotal),
  );

  const canIncrement = !disableIncrement && baseScore < effectiveUpperBound;
  const canDecrement = !disableDecrement && baseScore > normalizedMin;

  const increment = () => {
    if (!canIncrement) {
      return;
    }
    const nextValue = clamp(baseScore + 1, normalizedMin, effectiveUpperBound);
    onChange(nextValue);
  };

  const decrement = () => {
    if (!canDecrement) {
      return;
    }
    const nextValue = clamp(baseScore - 1, normalizedMin, effectiveUpperBound);
    onChange(nextValue);
  };

  const bonusChipShouldRender = showBonusChip && bonusSum !== 0;

  const circleLabel = bonusChipShouldRender
    ? `${label}: base ${baseScore}, bonus ${formatSigned(bonusSum)}, total ${totalScore}`
    : `${label}: base ${baseScore}`;

  return (
    <div className={styles.card} style={{ transform: `scale(${scale})` }}>
      <div className={styles.title}>{label}</div>

      <div className={styles.row}>
        <div className={styles.circle} aria-label={circleLabel} title={circleLabel}>
          <div className={styles.value}>{baseScore}</div>

          {bonusChipShouldRender && (
            <div className={styles.bonusChip}>{formatSigned(bonusSum)}</div>
          )}
        </div>

        <div className="text-zinc-400">{">"}</div>

        <div className={styles.circle}>
          <div className={styles.modLabel}>mod</div>
          <div className={styles.value}>{formatSigned(modifier)}</div>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            onClick={increment}
            disabled={!canIncrement}
            className={styles.btn}
            aria-label={`Increment ${id}`}
            title="Aumentar"
          >
            +
          </button>
          <button
            type="button"
            onClick={decrement}
            disabled={!canDecrement}
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
