"use client";

import { createContext, useContext, useState } from "react";

type SwapSettings = {
  slippageTolerance: number;
  setSlippageTolerance: (value: SwapSettings["slippageTolerance"]) => void;
};

export const SLIPPAGE_TOLERANCE_OPTIONS = [0.005, 0.01, 0.05] as const;

const DEFAULT_SLIPPAGE_TOLERANCE: SwapSettings["slippageTolerance"] =
  SLIPPAGE_TOLERANCE_OPTIONS[1];

const SwapSettingsContext = createContext<SwapSettings>({} as SwapSettings);

export const SwapSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [slippageTolerance, setSlippageTolerance] = useState(
    DEFAULT_SLIPPAGE_TOLERANCE,
  );

  return (
    <SwapSettingsContext.Provider
      value={{
        slippageTolerance,
        setSlippageTolerance,
      }}
    >
      {children}
    </SwapSettingsContext.Provider>
  );
};

export const useSwapSettings = () => {
  const context = useContext(SwapSettingsContext);

  if (!context) {
    throw new Error(
      "useSwapSettings must be used within a SwapSettingsProvider",
    );
  }

  return context;
};
