"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import CharacterCard from "./CharacterCard";
import NewCharacterCard from "./NewCharacterCard";
import CharacterDetailOverlay from "./CharacterDetailOverlay";
import styles from "./CharacterCarousel.module.css";

interface Character {
  id: string | number;
  name: string;
  race: string;
  class: string;
  level: number;
  image: string;
}

type SlideItem =
  | ({ type: "character" } & Character)
  | { type: "create"; id: string };

const DEMO_CHARACTERS: Character[] = [
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

type ApiCharacter = {
  id: string;
  name: string;
  level: number;
  portraitUrl: string | null;
  summaryJson: unknown;
};

function getSummaryName(summaryJson: unknown, key: "race" | "class") {
  if (!summaryJson || typeof summaryJson !== "object") return "Unknown";

  const identity = (summaryJson as { identity?: unknown }).identity;
  if (!identity || typeof identity !== "object") return "Unknown";

  const value = (identity as Record<string, unknown>)[key];
  if (!value || typeof value !== "object") return "Unknown";

  const name = (value as { name?: unknown }).name;
  return typeof name === "string" ? name : "Unknown";
}

function mapApiCharacter(character: ApiCharacter): Character {
  return {
    id: character.id,
    name: character.name,
    race: getSummaryName(character.summaryJson, "race"),
    class: getSummaryName(character.summaryJson, "class"),
    level: character.level,
    image: character.portraitUrl || "/images/charles_lourance.png",
  };
}

const CharacterCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "center", loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedCharacter, setExpandedCharacter] = useState<Character | null>(null);
  const [savedCharacters, setSavedCharacters] = useState<Character[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadCharacters() {
      try {
        const response = await fetch("/api/lootbook/characters");
        const body: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          console.error("Failed to load saved characters", {
            status: response.status,
            body,
          });
          return;
        }

        const characters = (body as { characters?: unknown }).characters;
        if (!Array.isArray(characters)) {
          console.error("Invalid characters response from backend", { body });
          return;
        }

        if (isMounted) {
          setSavedCharacters(characters.map((character) => mapApiCharacter(character as ApiCharacter)));
        }
      } catch (error) {
        console.error("Network error while loading saved characters", { error });
      }
    }

    void loadCharacters();
    return () => {
      isMounted = false;
    };
  }, []);

  const slides: SlideItem[] = useMemo(
    () => [
      { id: "new-start", type: "create" },
      ...DEMO_CHARACTERS.map((item) => ({ ...item, type: "character" as const })),
      ...savedCharacters.map((item) => ({ ...item, type: "character" as const })),
      { id: "new-end", type: "create" },
    ],
    [savedCharacters],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  const handleCharacterClick = (character: Character) => {
    setExpandedCharacter(character);
  };

  const handleCloseOverlay = () => {
    setExpandedCharacter(null);
  };

  return (
    <>
      <div className={styles.embla} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
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
                  onClick={() => handleCharacterClick(slide)}
                />
              ) : (
                <NewCharacterCard />
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {expandedCharacter && (
          <CharacterDetailOverlay
            character={{
              id: expandedCharacter.id,
              name: expandedCharacter.name,
              image: expandedCharacter.image,
            }}
            onClose={handleCloseOverlay}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CharacterCarousel;
