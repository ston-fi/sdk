"use client";
import { Button } from "@/components/ui/button";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useState } from "react";
import { buildLpTransaction } from "../actions/build-lp-transaction";
import { useLiquiditySimulationQuery } from "../hooks/liquidity-simulation-query";
import { useLiquidityProvideForm } from "../providers/liquidity-provide-form";

export const LiquidityProvideButton = () => {
  const walletAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const { assetA, assetB, pool, assetAUnits, assetBUnits } =
    useLiquidityProvideForm();
  const lpSimulationQuery = useLiquiditySimulationQuery();
  const [isClicked, setIsClicked] = useState(false);

  const handleLiquidityProvide = async () => {
    if (!lpSimulationQuery.data || !walletAddress) {
      return;
    }

    try {
      setIsClicked(true);
      const messages = await buildLpTransaction(
        lpSimulationQuery.data,
        walletAddress,
      );

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 5 * 60, // 5 minutes
        messages,
      });
    } finally {
      setIsClicked(false);
    }
  };

  if (!walletAddress) {
    return (
      <Button variant="default" onClick={() => tonConnectUI.openModal()}>
        Connect wallet
      </Button>
    );
  }

  if (!assetA || !assetB) {
    return (
      <Button variant="ghost" disabled>
        Select pair
      </Button>
    );
  }

  if (!pool) {
    return (
      <Button variant="ghost" disabled>
        Select pool
      </Button>
    );
  }

  if (!assetAUnits && !assetBUnits) {
    return (
      <Button variant="ghost" disabled>
        Enter an amount
      </Button>
    );
  }

  if (lpSimulationQuery.isFetching) {
    return (
      <Button variant="ghost" disabled>
        ...
      </Button>
    );
  }

  if (!lpSimulationQuery.data) {
    return (
      <Button variant="destructive" disabled>
        Simulation failed
      </Button>
    );
  }

  return (
    <Button
      disabled={!lpSimulationQuery.data || isClicked}
      onClick={handleLiquidityProvide}
    >
      Provide
    </Button>
  );
};
