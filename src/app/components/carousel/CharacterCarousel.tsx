"use client";
import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import CharacterCard from "../cards/CharacterCard";
import NewCharacterCard from "../cards/NewCharacterCard";
import styles from "../css/CharacterCarousel.module.css";

interface Character {
  id: number;
  name: string;
  race: string;
  class: string;
  level: number;
  image: string;
}

const characters: Character[] = [
  {
    id: 1,
    name: "Charles Lourance",
    race: "Human",
    class: "Warlock",
    level: 8,
    image: "/images/charles_lourance.png",
  },
  {
    id: 2,
    name: "Elora Windrunner",
    race: "Elf",
    class: "Ranger",
    level: 7,
    image: "/images/image3.png",
  },
  {
    id: 3,
    name: "Throg",
    race: "Orc",
    class: "Barbarian",
    level: 6,
    image: "/images/image2.png",
  },
];

const CharacterCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "center", loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

 type SlideItem =
  | ({ type: "character" } & Character)
  | { type: "create"; id: string };

const slides: SlideItem[] = [
  { id: "new-start", type: "create" },
  ...characters.map(c => ({ ...c, type: "character" as const })),
  { id: "new-end", type: "create" }
];

  return (
    <div className={styles.embla} ref={emblaRef}>
      <div className={styles.emblaContainer}>
        {slides.map((slide, index) => (
          <div
            key={slide.id ?? index}
            className={`${styles.emblaSlide} ${
              index === selectedIndex ? styles.active : styles.inactive
            }`}
          >
            {slide.type === "character" ? (
              <CharacterCard
                image={slide.image}
                name={slide.name}
                race={slide.race}
                class={slide.class}
                level={slide.level}
              />
            ) : (
              <NewCharacterCard />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterCarousel;