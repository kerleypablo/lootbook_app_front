"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useBuilderStep } from "@/features/character-builder/state/BuilderStepContext";
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

  const handleNext = () => {
    if (!isLast) router.push(steps[currentStep + 1]);
    else alert("Finalizado!");
  };

  return (
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
        disabled={!isNextEnabled}
        className={`${styles.button} ${styles.buttonFull} ${
          !isNextEnabled ? styles.buttonDisabled : ""
        }`}
      >
        {isLast ? "Finish" : "Next"}
      </button>
    </div>
  );
}
