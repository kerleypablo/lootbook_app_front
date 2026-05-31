"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BuilderStepFooter from "@/features/character-builder/components/BuilderStepFooter";
import BuilderStepTabs from "@/features/character-builder/components/BuilderStepTabs";
import { CharacterBuilderProvider } from "@/features/character-builder/state/CharacterBuilderContext";
import { BuilderStepProvider } from "@/features/character-builder/state/BuilderStepContext";
import Header from "@/shared/components/layout/Header";

export default function CharacterBuilderLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isCreating = pathname.startsWith("/characters/new");

  const animation = isCreating
    ? {
        initial: { x: 300, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -300, opacity: 0 },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };

  return (
    <CharacterBuilderProvider>
      <BuilderStepProvider>
        <div className="h-screen flex flex-col bg-gray-900">
          <div className="flex-shrink-0 z-50">
            <Header
              profileName="Lucien"
              profileImage="/images/charles_lourance.png"
            />
            <div className="px-4">
              <BuilderStepTabs />
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={animation.initial}
                animate={animation.animate}
                exit={animation.exit}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex-shrink-0 w-full px-4 py-4 bg-gray-900 border-t border-gray-800 z-50">
            <BuilderStepFooter />
          </div>
        </div>
      </BuilderStepProvider>
    </CharacterBuilderProvider>
  );
}
