"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/layout/Header";
import StepNavigation from "../../components/navigation/StepNavigation";
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
    <StepNavigationProvider>
      <div className="h-screen flex flex-col bg-gray-900">
        {/* Header fixo no topo */}
        <div className="flex-shrink-0 z-50">
          <Header
            profileName="Lucien"
            profileImage="/images/charles_lourance.png"
          />
        </div>

        {/* Conteúdo animado com controle de altura */}
        <div className="flex-1 overflow-hidden relative">
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

          <div className="absolute bottom-0 left-0 w-full px-4 py-4 bg-gray-900 border-t border-gray-800 z-50">
            <StepNavigationConsumer />
          </div>
        </div>
      </div>
    </StepNavigationProvider>
  );
}
