"use client";
import React, { useState, useRef, useEffect } from "react";
import ClassCard from "../../../components/cards/ClassCard";
import NavigationNewCharacter from "../../../components/navigation/NavigationNewCharacter";
import StepNavigation from "../../../components/navigation/StepNavigation";


export default function RacePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState<string>("#00ffe0");
  const selectedRef = useRef<HTMLDivElement>(null!);
  const [shadowTop, setShadowTop] = useState<number>(0);

  useEffect(() => {
    if (selectedRef.current) {
      const top = selectedRef.current.offsetTop;
      setShadowTop(top);
    }
  }, [selectedId]);

  const handleSelect = (id: string, _: number, color?: string) => {
    setSelectedId(id);
    if (color) setAccentColor(color);
  };

  return (
    <div className="relative h-full flex flex-col bg-gray-900 text-white">
      <div className="flex-shrink-0 z-40 px-4 pt-4">
        <NavigationNewCharacter />
      </div>

      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-20 relative">
        {selectedId && (
          <div
            className="absolute left-0 w-full z-0 transition-all duration-500 ease-in-out pointer-events-none"
            style={{
              height: "150px",
              top: `${shadowTop - 15}px`,
              backgroundColor: accentColor,
              borderRadius: "10px",
              filter: "blur(30px)",
              opacity: 1.8,
            }}
          />
        )}

       
      </div>

      <div className="fixed bottom-0 left-0 w-full px-4 py-4 bg-gray-900 border-t border-gray-800 z-50">
        <StepNavigation isNextEnabled={!!selectedId} />
      </div>
    </div>
  );
}
