"use client";
import React from "react";
import { useRouter } from "next/navigation";
import AddCircle from "@/assets/addcircle.svg";
import styles from "./NewCharacterCard.module.css";

const NewCharacterCard: React.FC = () => {
  const router = useRouter();

  return (
    <div className={styles.card}>
      <div className={styles.inner} onClick={() => router.push("/characters/new/race")}>
        <AddCircle className={styles.icon} />
        <p className={styles.text}>Create new character</p>
      </div>
    </div>
  );
};

export default NewCharacterCard;
