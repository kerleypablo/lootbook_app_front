"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./css/CharacterCard.module.css";
import Arrowicon from "@/assets/arrowicon.svg";

interface CharacterCardProps {
  image: string;
  name: string;
  race: string;
  class: string;
  level: number;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  image,
  name,
  race,
  class: characterClass,
  level,
}) => {
  const [boxShadowColor, setBoxShadowColor] = useState("rgba(0, 0, 0, 0.4)");
  const imgRef = useRef<HTMLImageElement | null>(null);
  console.log(image)
  function getAverageColor(imageEl: HTMLImageElement) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = 1;
    canvas.height = 1;
    context.drawImage(imageEl, 0, 0, 1, 1);
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
    setBoxShadowColor(`rgba(${r}, ${g}, ${b}, 0.4)`);
  }

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) getAverageColor(img);
    else if (img) img.onload = () => getAverageColor(img);
  }, [image]);

  return (
    <div className={styles.card} style={{ boxShadow: `0 0 30px ${boxShadowColor}` }}>
      <div className={styles.imageWrapper}>
        <img ref={imgRef} src={image} alt={name} className={styles.image} />
      </div>
      <div className={styles.info}>
        <div>
          <p className={styles.nameCard}>{name}</p>
          <p className={styles.infCard}>
            {race} • {characterClass} • Nível {level}
          </p>
        </div>
        <div className={styles.arrowCard}>
          <Arrowicon className="w-8 h-8 pt-3 pl-1" />
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;