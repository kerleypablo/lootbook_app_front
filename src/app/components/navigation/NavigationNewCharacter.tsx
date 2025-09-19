"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "../css/navigation.module.css";

export default function NavigationNewCharacter() {
  const pathname = usePathname();

  const tabs = [
    { href: "/characters/new/race", label: "Race" },
    { href: "/characters/new/class", label: "Class" },
    { href: "/characters/new/attribute", label: "Attribute" },
    { href: "/characters/new/background", label: "Background" },
    { href: "/characters/new/skills", label: "Skills" },
  ];

  const tabRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [underlineLeft, setUnderlineLeft] = useState(0);
  const underlineWidth = 13;

  const activeIndex = tabs.findIndex((tab) => tab.href === pathname);

  useEffect(() => {
    const activeTab = tabRefs.current[activeIndex];
    if (activeTab) {
      const left =
        activeTab.offsetLeft + activeTab.offsetWidth / 2 - underlineWidth / 2;
      setUnderlineLeft(left);
    }
  }, [activeIndex, underlineWidth]);

  return (
    <div className={styles.tabsWrapper}>
      <div className={styles.tabs}>
        {tabs.map((tab, index) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`${styles.tabButton} ${
                isActive ? styles.tabButtonActive : ""
              }`}
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
