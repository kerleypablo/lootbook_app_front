"use client";

import { motion } from "framer-motion";
import CharacterCarousel from "@/features/home/components/CharacterCarousel";
import Navigation from "@/features/home/components/Navigation";
import BottomNav from "@/shared/components/layout/BottomNav";
import Header from "@/shared/components/layout/Header";
import styles from "@/app/page.module.css";

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

        <div className="mt-6">
          <Navigation />
        </div>

        <div className="flex-2 flex items-center justify-center my-7">
          <CharacterCarousel />
        </div>
      </div>
      <BottomNav />
    </motion.main>
  );
}
