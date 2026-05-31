"use client";

import { useMemo, useState } from "react";
import styles from "./StatsPanel.module.css";

type StatKey = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";

type StatsMap = Record<StatKey, number>;

type SkillItem = {
  name: string;
  mod: string;
};

type FeatItem = {
  name: string;
  note: string;
};

type StatsPanelProps = {
  stats: StatsMap;
  skills?: SkillItem[];
  gear?: string[];
  feats?: FeatItem[];
  defaultTab?: string;
  tabs?: string[];
};

const DEFAULT_TABS = ["stats", "skills", "gear", "feats"];
const DEFAULT_SKILLS: SkillItem[] = [
  { name: "Athletics", mod: "+6" },
  { name: "Intimidation", mod: "+3" },
  { name: "Perception", mod: "+4" },
  { name: "Survival", mod: "+4" },
];

const DEFAULT_GEAR = [
  "Dwarven Warhammer",
  "Shield of the Deep",
  "Chain Mail +1",
  "Healing Potion x3",
  "Rations, 5 days",
];

const DEFAULT_FEATS: FeatItem[] = [
  { name: "Second Wind", note: "Class feature" },
  { name: "Action Surge", note: "Class feature" },
  { name: "Dwarven Resilience", note: "Class feature" },
];

function modifierFor(score: number) {
  const modifier = Math.floor((score - 10) / 2);
  return `${modifier >= 0 ? "+" : ""}${modifier}`;
}

function SwordIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="m16 16 4 4" />
      <path d="m19 21 2-2" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v4m0 10v4M3 12h4m10 0h4" />
      <path d="m6 6 2 2m8 8 2 2M6 18l2-2m8-8 2-2" />
    </svg>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statModifier}>{modifierFor(value)}</div>
    </div>
  );
}

function ModPill({ children }: { children: React.ReactNode }) {
  return <span className={styles.modPill}>{children}</span>;
}

function IconBox({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "gear" | "feat";
}) {
  return (
    <div
      className={[
        styles.iconBox,
        variant === "gear" ? styles.iconBoxGear : styles.iconBoxFeat,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

function ListRow({
  label,
  note,
  leading,
  trailing,
}: {
  label: string;
  note?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className={styles.listRow}>
      {leading}
      <div className={styles.listContent}>
        <div className={styles.listLabel}>{label}</div>
        {note ? <div className={styles.listNote}>{note}</div> : null}
      </div>
      {trailing}
    </div>
  );
}

export default function StatsPanel({
  stats,
  skills = DEFAULT_SKILLS,
  gear = DEFAULT_GEAR,
  feats = DEFAULT_FEATS,
  defaultTab = "stats",
  tabs = DEFAULT_TABS,
}: StatsPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const statsEntries = useMemo(() => Object.entries(stats), [stats]);

  return (
    <div className={styles.panel}>
      <div
        className={styles.tabTrack}
        role="tablist"
        aria-label="Character sheet sections"
      >
        {tabs.map((tab) => {
          const isActive = tab === activeTab;

          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={[
                styles.tabButton,
                isActive ? styles.tabButtonActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {activeTab === "stats" ? (
        <div className={styles.statsGrid}>
          {statsEntries.map(([key, value]) => (
            <StatCard key={key} label={key} value={value as number} />
          ))}
        </div>
      ) : null}

      {activeTab === "skills" ? (
        <div className={styles.list}>
          {skills.map((skill) => (
            <ListRow
              key={skill.name}
              label={skill.name}
              trailing={<ModPill>{skill.mod}</ModPill>}
            />
          ))}
        </div>
      ) : null}

      {activeTab === "gear" ? (
        <div className={styles.list}>
          {gear.map((item) => (
            <ListRow
              key={item}
              label={item}
              leading={
                <IconBox variant="gear">
                  <SwordIcon />
                </IconBox>
              }
            />
          ))}
        </div>
      ) : null}

      {activeTab === "feats" ? (
        <div className={styles.list}>
          {feats.map((feat) => (
            <ListRow
              key={feat.name}
              label={feat.name}
              note={feat.note}
              leading={
                <IconBox variant="feat">
                  <SparklesIcon />
                </IconBox>
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
