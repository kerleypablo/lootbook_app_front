"use client";

import { createContext, useContext, useState } from "react";

type StepNavigationContextValue = {
  isNextEnabled: boolean;
  setIsNextEnabled: (enabled: boolean) => void;
};

const StepNavigationContext = createContext<StepNavigationContextValue | undefined>(
  undefined
);

export function StepNavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  return (
    <StepNavigationContext.Provider value={{ isNextEnabled, setIsNextEnabled }}>
      {children}
    </StepNavigationContext.Provider>
  );
}

export function useStepNavigation() {
  const context = useContext(StepNavigationContext);
  if (!context) {
    throw new Error(
      "useStepNavigation must be used within a StepNavigationProvider"
    );
  }
  return context;
}
