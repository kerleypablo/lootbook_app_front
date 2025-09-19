"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/layout/Header";
import NavigationNewCharacter from "../../components/navigation/NavigationNewCharacter";
import StepNavigation from "../../components/navigation/StepNavigation";
import { CharacterBuilderProvider } from "@/features/character-builder/state/CharacterBuilderContext";
import {
  StepNavigationProvider,
  useStepNavigation,
} from "./StepNavigationContext";

function StepNavigationConsumer() {
  const { isNextEnabled } = useStepNavigation();
  return <StepNavigation isNextEnabled={isNextEnabled} />;
}

export default function CharactersLayout({
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
      <StepNavigationProvider>
        <div className="h-screen flex flex-col bg-gray-900">
          {/* Header e navegação fixos no topo */}
          <div className="flex-shrink-0 z-50">
            <Header
              profileName="Lucien"
              profileImage="/images/charles_lourance.png"
            />
            <div className="px-4">
              <NavigationNewCharacter />
            </div>
          </div>

          {/* Conteúdo animado */}
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

          {/* Navegação de passos fixa no rodapé */}
          <div className="flex-shrink-0 w-full px-4 py-4 bg-gray-900 border-t border-gray-800 z-50">
            <StepNavigationConsumer />
          </div>
        </div>
      </StepNavigationProvider>
    </CharacterBuilderProvider>
  );
}
