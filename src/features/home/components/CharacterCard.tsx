"use client";
import React, { useCallback, useState } from "react";
import Image from "next/image";
import Arrowicon from "@/assets/arrowicon.svg";
import styles from "./CharacterCard.module.css";

interface CharacterCardProps {
  image: string;
  name: string;
  race: string;
  class: string;
  level: number;
  onClick?: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  image,
  name,
  race,
  class: characterClass,
  level,
  onClick,
}) => {
  const [boxShadowColor, setBoxShadowColor] = useState("rgba(0, 0, 0, 0.4)");

  const getAverageColor = useCallback((imageEl: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = 1;
    canvas.height = 1;
    context.drawImage(imageEl, 0, 0, 1, 1);
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
    setBoxShadowColor(`rgba(${r}, ${g}, ${b}, 0.4)`);
  }, []);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    getAverageColor(e.currentTarget);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  const cardClassName = onClick
    ? `${styles.card} ${styles.cardInteractive}`
    : styles.card;

  return (
    <div
      className={cardClassName}
      style={{ boxShadow: `0 0 30px ${boxShadowColor}` }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.imageWrapper}>
        <Image
          src={image}
          alt={name}
          className={styles.image}
          fill
          sizes="100%"
          onLoad={handleLoad}
        />
      </div>
      <div className={styles.info}>
        <div>
          <p className={styles.nameCard}>{name}</p>
          <p className={styles.infCard}>
            {race} | {characterClass} | Nivel {level}
          </p>
        </div>
        <div className={styles.arrowCard}>
          <Arrowicon className="w-8 h-8 pt-3 pl-1" />
        </div>
      </div>
    </div>
  );
};

export default React.memo(CharacterCard);
