"use client";
import React from "react";
import { motion } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import SettingsIcon from "@/assets/settings-icon.svg";
import styles from "./Navigation.module.css";

const Navigation: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState("Recent");

  const tabs = ["Recent", "Favorites", "Archived"];

  return (
    <div className={styles.container}>
      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder="Search"
          className={styles.searchInput}
        />
        <FiSearch className={styles.searchIcon} />
      </div>

      <div className={styles.tabsWrapper}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.tabButton} ${
                activeTab === tab ? styles.tabButtonActive : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="relative inline-flex flex-col items-center">
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="underline"
                    className={styles.underline}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
              </span>
            </button>
          ))}
        </div>

        <motion.button
          whileHover={{ rotate: 45 }}
          whileTap={{ scale: 0.9 }}
          className={styles.settingsButton}
        >
          <SettingsIcon className="w-8 h-8" />
        </motion.button>
      </div>
    </div>
  );
};

export default Navigation;
