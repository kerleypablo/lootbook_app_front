"use client";

import { useEffect } from "react";
import { useBuilderStep } from "@/features/character-builder/state/BuilderStepContext";

export function useStepAvailability(isEnabled: boolean) {
  const { setIsNextEnabled } = useBuilderStep();

  useEffect(() => {
    setIsNextEnabled(isEnabled);
  }, [isEnabled, setIsNextEnabled]);
}
