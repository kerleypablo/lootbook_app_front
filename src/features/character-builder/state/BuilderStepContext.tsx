"use client";

import { createContext, useContext, useState } from "react";

type BuilderStepContextValue = {
  isNextEnabled: boolean;
  setIsNextEnabled: (enabled: boolean) => void;
};

const BuilderStepContext = createContext<BuilderStepContextValue | undefined>(
  undefined,
);

export function BuilderStepProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNextEnabled, setIsNextEnabled] = useState(false);

  return (
    <BuilderStepContext.Provider value={{ isNextEnabled, setIsNextEnabled }}>
      {children}
    </BuilderStepContext.Provider>
  );
}

export function useBuilderStep() {
  const context = useContext(BuilderStepContext);

  if (!context) {
    throw new Error("useBuilderStep must be used within a BuilderStepProvider");
  }

  return context;
}
