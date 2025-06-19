"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/layout/Header";

export default function CharactersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isCreating = pathname === "/characters/new";

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
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header fixo no topo */}
      <div className="flex-shrink-0 z-50">
        <Header
          profileName="Lucien"
          profileImage="/images/charles_lourance.png"
        />
      </div>

      {/* Conteúdo animado com controle de altura */}
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
    </div>
  );
}
