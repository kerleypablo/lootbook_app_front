"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "./css/bottomnav.module.css";
import BookIcon from "@/assets/BookIcon.svg";
import SwordIcon from "@/assets/SwordIcon.svg";
import SettingsIcon from "@/assets/SettingsIcon.svg";

const navItems = [
  { id: "book", icon: BookIcon },
  { id: "sword", icon: SwordIcon },
  { id: "settings", icon: SettingsIcon },
];

const BottomNav: React.FC = () => {
  const [activeTab, setActiveTab] = useState("book");
  const [circleX, setCircleX] = useState(0);
  const [clientReady, setClientReady] = useState(false);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    const index = navItems.findIndex((i) => i.id === activeTab);
    const el = buttonRefs.current[index];
    if (el) {
      const rect = el.getBoundingClientRect();
      const parentRect = el.parentElement?.getBoundingClientRect();
      if (parentRect) {
        setCircleX(rect.left - parentRect.left + rect.width / 2);
      }
    }
  }, [activeTab, clientReady]);

  return (
    <div className={styles.wrapper}>
      {/* semi-círculo do botão ativo */}
      <div className={styles.circleContainer}>
        {clientReady && (
          <motion.div
            layoutId="active-circle"
            className={styles.activeCircle}
            animate={{
              left: circleX - 20, // centraliza o semi-círculo com 40px de largura
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </div>

      <div className={styles.navBar}>
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              ref={(el) => (buttonRefs.current[index] = el)}
              className={`${styles.navButton} ${isActive ? styles.active : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="w-15 h-15" />
              {isActive && <div className={styles.glow} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
