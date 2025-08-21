"use client";
import React from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import styles from "../css/DraggableCard.module.css";

interface DraggableCardProps {
  onClose: () => void;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ onClose }) => {
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    slides: { perView: 1 },
  });

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={sliderRef}
        className={`keen-slider ${styles.slider}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`keen-slider__slide ${styles.slide}`}>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ut
            elit vel massa viverra aliquet.
          </p>
          <button className={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraggableCard;
