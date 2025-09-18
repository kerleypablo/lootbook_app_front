"use client";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { animate, motion, useMotionValue } from "framer-motion";
import styles from "../css/DraggableCard.module.css";

interface DraggableCardProps {
  title: string;
  description: string;
  image: string;
  accentColor?: string;
  onClose: () => void;
}

const BASE_HEIGHT = 320;
const ENTRY_TRANSITION = { type: "spring", stiffness: 260, damping: 30 } as const;
const SPRING_CONFIG = { type: "spring", stiffness: 260, damping: 30, mass: 0.2 } as const;

const DRAG_ZONE_HEIGHT = 110;

type DragSnapshot = {
  startY: number;
  startHeight: number;
  lastY: number;
  lastTime: number;
  velocity: number;
};

const DraggableCard: FC<DraggableCardProps> = ({
  title,
  description,
  image,
  accentColor,
  onClose,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const height = useMotionValue(BASE_HEIGHT);
  const dragSnapshot = useRef<DragSnapshot>({
    startY: 0,
    startHeight: BASE_HEIGHT,
    lastY: 0,
    lastTime: 0,
    velocity: 0,
  });

  const getMaxHeight = useCallback(() => {
    if (typeof window === "undefined") {
      return Math.max(BASE_HEIGHT, 600);
    }

    return Math.max(BASE_HEIGHT, Math.min(window.innerHeight * 0.8, 800));
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const controls = animate(height, BASE_HEIGHT, SPRING_CONFIG);
    return () => controls.stop();
  }, [height]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const sheetElement = sheetRef.current;
      if (!sheetElement) {
        return;
      }

      const handleElement = (event.target as HTMLElement).closest("[data-sheet-handle=true]");
      const isInDragZone = (() => {
        const rect = sheetElement.getBoundingClientRect();
        return event.clientY - rect.top <= DRAG_ZONE_HEIGHT;
      })();

      if (!handleElement && !isInDragZone) {
        return;
      }

      event.preventDefault();
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      const currentHeight = height.get();
      dragSnapshot.current = {
        startY: event.clientY,
        startHeight: currentHeight,
        lastY: event.clientY,
        lastTime: now,
        velocity: 0,
      };

      sheetElement.setPointerCapture(event.pointerId);
      setIsDragging(true);
    },
    [height],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) {
        return;
      }

      event.preventDefault();
      const snapshot = dragSnapshot.current;
      const delta = event.clientY - snapshot.startY;
      const maxHeight = getMaxHeight();
      const nextHeight = Math.min(
        Math.max(snapshot.startHeight - delta, BASE_HEIGHT),
        maxHeight,
      );
      height.set(nextHeight);

      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      const deltaSinceLast = event.clientY - snapshot.lastY;
      const elapsed = now - snapshot.lastTime || 1;
      snapshot.velocity = deltaSinceLast / elapsed;
      snapshot.lastY = event.clientY;
      snapshot.lastTime = now;
    },
    [getMaxHeight, height, isDragging],
  );

  const finishDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) {
        return;
      }

      event.preventDefault();
      try {
        sheetRef.current?.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore release errors when pointer capture was not set.
      }
      setIsDragging(false);

      const snapshot = dragSnapshot.current;
      const delta = event.clientY - snapshot.startY;
      const velocity = snapshot.velocity;
      const maxHeight = getMaxHeight();
      const currentHeight = height.get();

      if (delta > 120 || velocity > 0.8) {
        onClose();
        return;
      }

      let targetHeight = currentHeight;
      if (currentHeight < BASE_HEIGHT + 40) {
        targetHeight = BASE_HEIGHT;
      } else if (currentHeight > maxHeight - 40) {
        targetHeight = maxHeight;
      }

      if (targetHeight !== currentHeight) {
        animate(height, targetHeight, SPRING_CONFIG);
      }
    },
    [getMaxHeight, height, isDragging, onClose],
  );

  const cardContent = (
    <motion.div
      className={styles.backdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        ref={sheetRef}
        className={styles.sheet}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={ENTRY_TRANSITION}
        style={{
          height,
          borderTopColor: accentColor ?? "transparent",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <div className={styles.handle} data-sheet-handle="true" />
        <div className={styles.header}>
          <div className={styles.imageWrapper}>
            <Image src={image} alt={title} width={64} height={64} className={styles.image} />
          </div>
          <div className={styles.titleArea}>
            <span className={styles.label}>Classe selecionada</span>
            <h3>{title}</h3>
          </div>
        </div>
        <div className={styles.content}>
          <h4>{"Descri\u00E7\u00E3o"}</h4>
          <p>{description}</p>
        </div>
      </motion.div>
    </motion.div>
  );

  if (!isMounted) {
    return null;
  }

  return createPortal(cardContent, document.body);
};

export default DraggableCard;

