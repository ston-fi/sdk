"use client";

import { createContext, useContext, useState } from "react";

type LiquidityProvideSettings = {
  slippageTolerance: number;
  setSlippageTolerance: (
    value: LiquidityProvideSettings["slippageTolerance"],
  ) => void;
};

export const SLIPPAGE_TOLERANCE_OPTIONS = [0.005, 0.01, 0.05] as const;

const DEFAULT_SLIPPAGE_TOLERANCE: LiquidityProvideSettings["slippageTolerance"] =
  SLIPPAGE_TOLERANCE_OPTIONS[1];

const LiquidityProvideSettingsContext = createContext<LiquidityProvideSettings>(
  {} as LiquidityProvideSettings,
);

export const LiquidityProvideSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [slippageTolerance, setSlippageTolerance] = useState(
    DEFAULT_SLIPPAGE_TOLERANCE,
  );

  return (
    <LiquidityProvideSettingsContext.Provider
      value={{
        slippageTolerance,
        setSlippageTolerance,
      }}
    >
      {children}
    </LiquidityProvideSettingsContext.Provider>
  );
};

export const useLiquidityProvideSettings = () => {
  const context = useContext(LiquidityProvideSettingsContext);

  if (!context) {
    throw new Error(
      "useLiquidityProvideSettings must be used within a LiquidityProvideSettingsProvider",
    );
  }

  return context;
};
