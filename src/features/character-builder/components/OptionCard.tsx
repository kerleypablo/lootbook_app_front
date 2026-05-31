"use client";
import { CSSProperties, FC, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import OptionDetailSheet from "./OptionDetailSheet";
import { getDominantColor } from "@/features/character-builder/utils/getDominantColor";
import styles from "./OptionCard.module.css";

interface OptionCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  selected: boolean;
  onSelect: (id: string, accentColor?: string) => void;
  accentColor?: string;
  innerRef?: React.RefObject<HTMLDivElement | null>;
}

const OptionCard: FC<OptionCardProps> = ({
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
          <OptionDetailSheet
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

export default OptionCard;
