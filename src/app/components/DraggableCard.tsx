"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "./css/draggablecard.module.css";

const DraggableCard: React.FC = () => {
  return (
    <motion.div
      className={styles.sheet}
      drag="y"
      dragConstraints={{ top: -300, bottom: 0 }}
      dragElastic={0.2}
    >
      <div className={styles.handle} />
      <div className={styles.content}>Arraste para cima</div>
    </motion.div>
  );
};

export default DraggableCard;
