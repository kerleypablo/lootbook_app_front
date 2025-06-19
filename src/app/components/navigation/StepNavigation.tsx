"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "../css/stepNavigation.module.css";

const steps = [
  "/characters/new/race",
  "/characters/new/class",
  "/characters/new/attribute",
  "/characters/new/background",
  "/characters/new/skills",
];

type StepNavigationProps = {
  isNextEnabled?: boolean;
}; 

export default function StepNavigation({ isNextEnabled = false }: StepNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

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
    else alert("Finalizado! 🎉");
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
        className={`${styles.button} ${styles.buttonFull} ${!isNextEnabled ? styles.buttonDisabled : ""}`}
      >
        {isLast ? "Finish" : "Next"}
      </button>
          </div>
  );
}
