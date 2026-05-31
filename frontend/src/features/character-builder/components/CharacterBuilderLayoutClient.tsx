"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BuilderStepFooter from "@/features/character-builder/components/BuilderStepFooter";
import BuilderStepTabs from "@/features/character-builder/components/BuilderStepTabs";
import { CharacterBuilderProvider } from "@/features/character-builder/state/CharacterBuilderContext";
import { BuilderStepProvider } from "@/features/character-builder/state/BuilderStepContext";
import Header from "@/shared/components/layout/Header";
import styles from "./CharacterBuilderLayoutClient.module.css";

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
        <div className={styles.layout}>
          <div className={styles.topSection}>
            <Header
              profileName="Lucien"
              profileImage="/images/charles_lourance.png"
            />
            <div className={styles.tabsWrapper}>
              <BuilderStepTabs />
            </div>
          </div>

          <div className={styles.contentViewport}>
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={animation.initial}
                animate={animation.animate}
                exit={animation.exit}
                transition={{ duration: 0.3 }}
                className={styles.contentFrame}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className={styles.footerSection}>
            <BuilderStepFooter />
          </div>
        </div>
      </BuilderStepProvider>
    </CharacterBuilderProvider>
  );
}
