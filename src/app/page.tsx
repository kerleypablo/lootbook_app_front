"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Navigation from './components/Navigation';
import CharacterCarousel from './components/CharacterCarousel';
import BottomNav from './components/BottomNav';
import styles from "./page.module.css";

export default function Home() {
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
