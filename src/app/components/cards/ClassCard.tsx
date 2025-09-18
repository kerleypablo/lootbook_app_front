"use client";
import { CSSProperties, FC, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import styles from "../css/ClassCard.module.css";
import DraggableCard from "./DraggableCard";

interface ClassCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  selected: boolean;
  onSelect: (id: string, accentColor?: string) => void;
  accentColor?: string;
  innerRef?: React.RefObject<HTMLDivElement>;
}

const getDominantColor = (imageElement: HTMLImageElement): string => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#ffffff";

  const width = (canvas.width = imageElement.naturalWidth);
  const height = (canvas.height = imageElement.naturalHeight);
  ctx.drawImage(imageElement, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height).data;
  let r = 0,
    g = 0,
    b = 0,
    count = 0;

  for (let i = 0; i < imageData.length; i += 4 * 50) {
    r += imageData[i];
    g += imageData[i + 1];
    b += imageData[i + 2];
    count++;
  }

  r = Math.floor(r / count);
  g = Math.floor(g / count);
  b = Math.floor(b / count);

  return "rgb(" + r + ", " + g + ", " + b + ")";
};

const ClassCard: FC<ClassCardProps> = ({
  id,
  name,
  description,
  image,
  selected,
  onSelect,
  accentColor,
  innerRef,
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!selected && showDetails) {
      setShowDetails(false);
    }
  }, [selected, showDetails]);

  const handleClick = () => {
    if (imgRef.current) {
      const color = getDominantColor(imgRef.current);
      onSelect(id, color);
    } else {
      onSelect(id);
    }
  };

  const accentStyle: CSSProperties | undefined =
    selected && accentColor
      ? ({ "--accent-color": accentColor } as CSSProperties)
      : undefined;

  return (
    <div
      className={`${styles.card} ${selected ? styles.active : ""}`}
      onClick={handleClick}
      ref={innerRef}
      style={accentStyle}
    >
      <div className={styles.imageWrapper}>
        <Image
          src={image}
          alt={name}
          fill
          className={styles.image}
          ref={imgRef}
        />
      </div>
      <div className={styles.overlay}>
        <h2>{name}</h2>
        <p>{description}</p>
        {selected && (
          <button
            className={styles.detailsButton}
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(true);
            }}
          >
            Details
          </button>
        )}
      </div>
      <AnimatePresence>
        {showDetails && (
          <DraggableCard
            key="class-details"
            title={name}
            description={description}
            image={image}
            accentColor={accentColor}
            onClose={() => setShowDetails(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClassCard;
