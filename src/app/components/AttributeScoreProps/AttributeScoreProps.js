"use client";
import React, { useMemo } from "react";
import styles from "../css/AttributeScore.module.css";

/** @typedef {"STR"|"DEX"|"CON"|"INT"|"WIS"|"CHA"} AttributeKey */

/**
 * @param {{
 *  id: AttributeKey,
 *  label: string,
 *  base: number,
 *  bonuses?: {race?:number, class?:number, feat?:number, item?:number, temp?:number},
 *  min?: number,                 // ignorado para o bloqueio do botão; decrementa até 0
 *  max?: number,
 *  disableIncrement?: boolean,
 *  disableDecrement?: boolean,
 *  onChange: (nextBase:number)=>void,
 *  showBonusChip?: boolean,
 *  scale?: number
 * }} props
 */
export default function AbilityScore({
  id,
  label,
  base,
  bonuses = {},
  max = 20,
  disableIncrement,
  disableDecrement,
  onChange,
  showBonusChip = true,
  scale = 1.16,
}) {
  const bonusSum = useMemo(
    () => Object.values(bonuses).reduce((acc, v = 0) => acc + v, 0),
    [bonuses]
  );
  const total = base + bonusSum;
  const mod = Math.floor((total - 10) / 2);
  const fmt = (n) => (n > 0 ? `+${n}` : `${n}`);

  const inc = () => {
    if (!disableIncrement && base < max) onChange(base + 1);
  };

  const dec = () => {
    if (disableDecrement) return;
    const next = base - 1;
    onChange(next < 0 ? 0 : next);
  };

  return (
    <div className={styles.card} style={{ transform: `scale(${scale})` }}>
      <div className={styles.title}>{label}</div>

      <div className={styles.row}>
        {/* círculo 1: valor base */}
        <div className={styles.circle}>
          <div className={styles.value}>{base}</div>

          {showBonusChip && bonusSum !== 0 && (
            <div className={styles.bonusChip}>{fmt(bonusSum)}</div>
          )}
        </div>

        {/* sinal entre os círculos */}
        <div className="text-zinc-400">{">"}</div>

        {/* círculo 2: modifier (sempre visível, inclusive negativo) */}
        <div className={styles.circle}>
          <div className={styles.modLabel}>mod</div>
          <div className={styles.value}>{fmt(mod)}</div>
        </div>

        {/* controles */}
        <div className={styles.controls}>
          <button
            type="button"
            onClick={inc}
            disabled={disableIncrement || base >= max}
            className={styles.btn}
            aria-label={`Increment ${id}`}
            title="Aumentar"
          >
            +
          </button>
          <button
            type="button"
            onClick={dec}
            disabled={disableDecrement || base <= 0}
            className={styles.btn}
            aria-label={`Decrement ${id}`}
            title="Diminuir"
          >
            –
          </button>
        </div>
      </div>
    </div>
  );
}
