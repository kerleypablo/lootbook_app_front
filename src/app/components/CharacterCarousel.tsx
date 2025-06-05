"use client";
import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import CharacterCard from "./CharacterCard";
import styles from "./css/CharacterCarousel.module.css";

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
    name: "Charles Lourance",
    race: "Human",
    class: "Warlock",
    level: 8,
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

  return (
    <div className={styles.embla} ref={emblaRef}>
      <div className={styles.emblaContainer}>
        {characters.map((character, index) => (
          <div
            key={character.id}
            className={`${styles.emblaSlide} ${
              index === selectedIndex ? styles.active : styles.inactive
            }`}
          >
            <CharacterCard
              image={character.image}
              name={character.name}
              race={character.race}
              class={character.class}
              level={character.level}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterCarousel;