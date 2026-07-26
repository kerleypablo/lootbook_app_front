"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useBuilderStep } from "@/features/character-builder/state/BuilderStepContext";
import { createCharacterFromBuilder } from "@/features/character-builder/api/characters";
import { useCharacterBuilder } from "@/features/character-builder/state/CharacterBuilderContext";
import styles from "./BuilderStepFooter.module.css";

const steps = [
  "/characters/new/race",
  "/characters/new/class",
  "/characters/new/attribute",
  "/characters/new/background",
  "/characters/new/skills",
];

export default function BuilderStepFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const { isNextEnabled } = useBuilderStep();
  const builder = useCharacterBuilder();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const currentStep = steps.indexOf(pathname);
  const totalSteps = steps.length;

  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  const handleBack = () => {
    if (!isFirst) router.push(steps[currentStep - 1]);
  };

  const handleCancel = () => {
    router.push("/");
  };

  const handleNext = async () => {
    if (!isLast) {
      router.push(steps[currentStep + 1]);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await createCharacterFromBuilder(builder);
      builder.reset();
      router.replace("/");
    } catch (error) {
      console.error("Failed to finish character creation", { error });
      setSaveError(error instanceof Error ? error.message : "Nao foi possivel salvar o personagem.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {saveError && <p className="mb-2 text-center text-sm text-red-300">{saveError}</p>}
      <div className="flex justify-between gap-4">
        {isFirst ? (
          <button
            onClick={handleCancel}
            className={`${styles.button} ${styles.buttonFull} ${styles.buttonFlat}`}
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={handleBack}
            className={`${styles.button} ${styles.buttonFull} ${styles.buttonFlat}`}
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!isNextEnabled || isSaving}
          className={`${styles.button} ${styles.buttonFull} ${
            !isNextEnabled ? styles.buttonDisabled : ""
          }`}
        >
          {isSaving ? "Saving..." : isLast ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
