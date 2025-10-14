"use client";

import { useTonAddress } from "@tonconnect/ui-react";
import type React from "react";

export const WalletGuard: React.FC<
  React.PropsWithChildren<{ fallback?: React.ReactNode }>
> = ({ children, fallback = null }) => {
  const walletAddress = useTonAddress();

  if (!walletAddress) {
    return fallback;
  }

  return children;
};
