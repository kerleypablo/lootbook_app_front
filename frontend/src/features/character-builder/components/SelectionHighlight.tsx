"use client";

import styles from "./SelectionHighlight.module.css";

type SelectionHighlightProps = {
  color: string;
  top: number;
};

export default function SelectionHighlight({
  color,
  top,
}: SelectionHighlightProps) {
  return (
    <div
      className={styles.highlight}
      style={{
        height: "150px",
        top: `${top - 15}px`,
        backgroundColor: color,
      }}
    />
  );
}
