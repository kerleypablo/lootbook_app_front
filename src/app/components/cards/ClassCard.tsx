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
  const context = canvas.getContext("2d");

  if (!context) {
    return "#ffffff";
  }

  const width = (canvas.width = imageElement.naturalWidth);
  const height = (canvas.height = imageElement.naturalHeight);
  context.drawImage(imageElement, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height).data;
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let index = 0; index < imageData.length; index += 4 * 50) {
    r += imageData[index];
    g += imageData[index + 1];
    b += imageData[index + 2];
    count += 1;
  }

  if (count === 0) {
    return "#ffffff";
  }

  const averageR = Math.floor(r / count);
  const averageG = Math.floor(g / count);
  const averageB = Math.floor(b / count);

  return `rgb(${averageR}, ${averageG}, ${averageB})`;
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
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!selected && showDetails) {
      setShowDetails(false);
    }
  }, [selected, showDetails]);

  const handleClick = () => {
    if (imageRef.current) {
      const color = getDominantColor(imageRef.current);
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
          ref={imageRef}
        />
      </div>
      <div className={styles.overlay}>
        <h2>{name}</h2>
        <p>{description}</p>
        {selected && (
          <button
            className={styles.detailsButton}
            onClick={(event) => {
              event.stopPropagation();
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
