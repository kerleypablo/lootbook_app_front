"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../css/navigation.module.css"; // ou ajuste conforme o nome real do arquivo .module.css

export default function NavigationNewCharacter() {
  const pathname = usePathname();
  

  const tabs = [
    { href: "/characters/new/race", label: "Race" },
    { href: "/characters/new/class", label: "Class" },
    { href: "/characters/new/Attribute", label: "Attribute" },
     { href: "/characters/new/background", label: "Background" },
      { href: "/characters/new/Skills", label: "Skills" },
  ];

  return (
    <div className={styles.tabsWrapper}>
      <div className={styles.tabs}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} className={styles.tabButton}>
              <div className={isActive ? styles.tabButtonActive : ""}>
                {tab.label}
              </div>
              {isActive && <div className={styles.underline} />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
