"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Navigation from './components/Navigation';
import CharacterCarousel from './components/CharacterCarousel';
import BottomNav from './components/BottomNav';

export default function Home() {
  return (
        <motion.main 
        className="flex min-h-screen flex-col text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
      <div className="max-w-md mx-auto w-full px-4 py-6 flex flex-col min-h-screen">
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
