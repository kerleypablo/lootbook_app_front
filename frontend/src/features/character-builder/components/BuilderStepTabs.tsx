"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCharacterBuilder } from "@/features/character-builder/state/CharacterBuilderContext";
import styles from "./BuilderStepTabs.module.css";

const TABS = [
  { href: "/characters/new/race", label: "Race" },
  { href: "/characters/new/class", label: "Class" },
  { href: "/characters/new/attribute", label: "Attribute" },
  { href: "/characters/new/background", label: "Background" },
  { href: "/characters/new/skills", label: "Skills" },
] as const;

type Tab = (typeof TABS)[number];

export default function BuilderStepTabs() {
  const pathname = usePathname();
  const { selectedRaceId, selectedClassId } = useCharacterBuilder();

  const tabRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [underlineLeft, setUnderlineLeft] = useState(0);
  const underlineWidth = 13;

  const activeIndex = TABS.findIndex((tab) => tab.href === pathname);
  const [furthestIndex, setFurthestIndex] = useState(() =>
    activeIndex >= 0 ? activeIndex : 0,
  );

  useEffect(() => {
    if (activeIndex >= 0) {
      setFurthestIndex((prev) => Math.max(prev, activeIndex));
    }
  }, [activeIndex]);

  useEffect(() => {
    setFurthestIndex((prev) => {
      if (!selectedRaceId) {
        return 0;
      }
      if (!selectedClassId) {
        return Math.min(prev, 1);
      }
      return prev;
    });
  }, [selectedRaceId, selectedClassId]);

  const unlockByHref = useMemo<Record<Tab["href"], boolean>>(
    () => ({
      "/characters/new/race": true,
      "/characters/new/class": Boolean(selectedRaceId),
      "/characters/new/attribute": Boolean(selectedRaceId && selectedClassId),
      "/characters/new/background": Boolean(selectedRaceId && selectedClassId),
      "/characters/new/skills": Boolean(selectedRaceId && selectedClassId),
    }),
    [selectedRaceId, selectedClassId],
  );

  const completedByIndex = useMemo<Record<number, boolean>>(
    () => ({
      0: Boolean(selectedRaceId),
      1: Boolean(selectedClassId),
      2: furthestIndex >= 2,
      3: furthestIndex >= 3,
      4: furthestIndex >= 4,
    }),
    [furthestIndex, selectedClassId, selectedRaceId],
  );

  useEffect(() => {
    const activeTab =
      activeIndex >= 0 ? tabRefs.current[activeIndex] : undefined;

    if (activeTab) {
      const left =
        activeTab.offsetLeft + activeTab.offsetWidth / 2 - underlineWidth / 2;
      setUnderlineLeft(left);
    }
  }, [activeIndex, underlineWidth]);

  return (
    <div className={styles.tabsWrapper}>
      <div className={styles.tabs}>
        {TABS.map((tab, index) => {
          const isActive = index === activeIndex;
          const isCompleted = completedByIndex[index] ?? false;
          const isHighlighted = isActive || isCompleted;
          const isFutureStep =
            activeIndex >= 0 ? index > activeIndex : !unlockByHref[tab.href];
          const isDisabled = isFutureStep && !unlockByHref[tab.href];
          const className = [
            styles.tabButton,
            isHighlighted ? styles.tabButtonActive : "",
            isDisabled ? styles.tabButtonDisabled : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-disabled={isDisabled}
              tabIndex={isDisabled ? -1 : undefined}
              onClick={(event) => {
                if (isDisabled) {
                  event.preventDefault();
                  event.stopPropagation();
                }
              }}
              className={className}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
            >
              {tab.label}
            </Link>
          );
        })}
        <span className={styles.underline} style={{ left: underlineLeft }} />
      </div>
    </div>
  );
}
