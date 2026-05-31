"use client";

import { useMemo } from "react";
import type { AttributeKey } from "@/features/character-builder/types";

const POINT_BUY_MAX = 27;

const POINT_BUY_COST_TABLE: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export function usePointBuy(baseAttributes: Record<AttributeKey, number>) {
  const pointsSpent = useMemo(
    () =>
      (Object.keys(baseAttributes) as AttributeKey[]).reduce(
        (acc, key) => acc + (POINT_BUY_COST_TABLE[baseAttributes[key]] ?? 0),
        0,
      ),
    [baseAttributes],
  );

  return {
    pointsMax: POINT_BUY_MAX,
    pointsSpent,
    pointsRemaining: Math.max(0, POINT_BUY_MAX - pointsSpent),
  };
}
