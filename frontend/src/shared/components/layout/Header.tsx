"use client";
import React from "react";
import { motion } from "framer-motion";
import GoblinSymbol from "@/assets/goblinsymbol.svg";
import Logo from "@/assets/logo.svg";
import styles from "./Header.module.css";

interface HeaderProps {
  profileName: string;
  profileImage: string;
}

const Header: React.FC<HeaderProps> = ({ profileName, profileImage }) => {
  return (
    <header className={styles.header}>
      <div className={styles.brandGroup}>
        <GoblinSymbol className={styles.brandIcon} />
        <Logo className={styles.brandLogo} />
      </div>

      <div className={styles.profileGroup}>
        <div className={styles.profileText}>
          <p className={styles.profileLabel}>Profile</p>
          <p className={styles.profileName}>{profileName}</p>
        </div>
        <motion.div
          className={styles.profileAvatar}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Profile"
          title={profileName}
        >
          <div
            className={styles.profileAvatarImage}
            style={{
              backgroundImage: `url(${profileImage})`,
            }}
          />
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
