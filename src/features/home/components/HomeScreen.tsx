"use client";

import { motion } from "framer-motion";
import CharacterCarousel from "@/features/home/components/CharacterCarousel";
import Navigation from "@/features/home/components/Navigation";
import BottomNav from "@/shared/components/layout/BottomNav";
import Header from "@/shared/components/layout/Header";
import styles from "@/app/page.module.css";
import screenStyles from "./HomeScreen.module.css";

export default function HomeScreen() {
  return (
    <motion.main
      className={styles.pageWrapper}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.innerWrapper}>
        <Header
          profileName="Lucien"
          profileImage="/images/charles_lourance.png"
        />

        <div className={screenStyles.navigationSection}>
          <Navigation />
        </div>

        <div className={screenStyles.carouselSection}>
          <CharacterCarousel />
        </div>
      </div>
      <BottomNav />
    </motion.main>
  );
}
