"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FiChevronLeft, FiHeart } from "react-icons/fi";
import StatsPanel from "./StatsPanel";
import styles from "./CharacterDetailOverlay.module.css";

export type CharacterDetail = {
  id: number;
  name: string;
  image: string;
};

type CharacterDetailOverlayProps = {
  character: CharacterDetail;
  onClose: () => void;
};

const IMAGE_COMPACT_HEIGHT = "60vh";
const INFO_COMPACT_HEIGHT = "40vh";

export default function CharacterDetailOverlay({
  character,
  onClose,
}: CharacterDetailOverlayProps) {
  const [isCompact, setIsCompact] = useState(false);
  const mockStats = {
    STR: 17,
    DEX: 10,
    CON: 16,
    INT: 9,
    WIS: 12,
    CHA: 11,
  } as const;

  useEffect(() => {
    const timer = window.setTimeout(() => setIsCompact(true), 320);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div className={styles.panel} layout>
        <button
          type="button"
          className={styles.backButton}
          onClick={onClose}
          aria-label="Voltar"
        >
          <FiChevronLeft size={22} />
        </button>

        <motion.div
          className={styles.imageSection}
          animate={{ height: isCompact ? IMAGE_COMPACT_HEIGHT : "100vh" }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Image
            src={character.image}
            alt={character.name}
            fill
            sizes="100%"
            className={styles.image}
            priority
          />
          <div className={styles.imageGradient} />
          <motion.div
            className={styles.initialBar}
            initial={false}
            animate={{
              opacity: isCompact ? 0 : 1,
              y: isCompact ? 40 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <span>{character.name}</span>
            <button type="button" className={styles.heartButton} aria-label="Favoritar">
              <FiHeart size={20} />
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.infoSection}
          animate={{
            height: isCompact ? INFO_COMPACT_HEIGHT : "0vh",
            opacity: isCompact ? 1 : 0,
          }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <motion.div
            className={styles.infoContent}
            initial={false}
            animate={{
              opacity: isCompact ? 1 : 0,
              y: isCompact ? 0 : 40,
            }}
            transition={{ duration: 0.35, ease: "easeOut", delay: isCompact ? 0.05 : 0 }}
          >
            <div className={styles.infoHeader}>
              <span>{character.name}</span>
              <button type="button" className={styles.heartButton} aria-label="Favoritar">
                <FiHeart size={20} />
              </button>
            </div>
            <StatsPanel stats={mockStats} />
            <div className={styles.infoBlock}>
              <p className={styles.infoBlockTitle}>Lore</p>
              <p className={styles.infoBlockBody}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                feugiat, eros non feugiat fermentum, justo lorem faucibus
                libero, vitae faucibus purus leo vitae turpis. Morbi accumsan
                iaculis tortor, nec viverra est feugiat vel.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
