"use client";
import React from "react";
import styles from "./css/NewCharacterCard.module.css";
import AddCircle from "@/assets/addcircle.svg";
import { useRouter } from "next/navigation";

const NewCharacterCard: React.FC = () => {
    const router = useRouter();
  return (
    <div className={styles.card}>
      <div className={styles.inner}  onClick={() => router.push("/characters/new")}>
        <AddCircle className={styles.icon} />
        <p className={styles.text}>Create new character</p>
      </div>
    </div>
  );
};

export default NewCharacterCard;