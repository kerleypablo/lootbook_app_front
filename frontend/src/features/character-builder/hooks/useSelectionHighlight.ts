"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type UseSelectionHighlightParams = {
  selectedId: string | null;
  storedAccentColor: string | null;
  onSelect: (id: string | null, accentColor?: string | null) => void;
};

export function useSelectionHighlight({
  selectedId,
  storedAccentColor,
  onSelect,
}: UseSelectionHighlightParams) {
  const [accentColor, setAccentColor] = useState<string | null>(storedAccentColor);
  const selectedRef = useRef<HTMLDivElement>(null);
  const [shadowTop, setShadowTop] = useState(0);

  useEffect(() => {
    setAccentColor(storedAccentColor ?? null);
  }, [storedAccentColor]);

  useEffect(() => {
    if (selectedRef.current) {
      setShadowTop(selectedRef.current.offsetTop);
    }
  }, [selectedId]);

  const handleSelect = (id: string, color?: string) => {
    onSelect(id, color ?? null);
    if (color) {
      setAccentColor(color);
    }
  };

  const highlightColor = useMemo(
    () => accentColor ?? storedAccentColor,
    [accentColor, storedAccentColor],
  );

  return {
    handleSelect,
    highlightColor,
    selectedRef,
    shadowTop,
  };
}
