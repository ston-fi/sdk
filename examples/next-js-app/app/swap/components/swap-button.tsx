"use client";

import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { buildSwapTransaction } from "../actions/build-swap-transaction";
import { useSwapSimulation } from "../hooks/swap-simulation-query";
import { useSwapStatusNotifications } from "../hooks/swap-status-notifications";
import { useSwapStatusQuery } from "../hooks/swap-status-query";
import { useSwapForm } from "../providers/swap-form";
import { useSetSwapTransactionDetails } from "../providers/swap-transaction";

export function SwapButton() {
  const walletAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const {
    offerAmount,
    offerAsset,
    askAsset,
    askAmount,
    referralValue,
    referralAddress,
  } = useSwapForm();
  const swapSimulationQuery = useSwapSimulation();
  const setSwapTransaction = useSetSwapTransactionDetails();
  const swapStatusQuery = useSwapStatusQuery();
  const [isClicked, setIsClicked] = useState(false);
  const { toast } = useToast();

  useSwapStatusNotifications();

  const handleSwap = async () => {
    if (!swapSimulationQuery.data || !walletAddress) {
      return;
    }

    try {
      const queryId = Date.now();
      setIsClicked(true);
      const messages = await buildSwapTransaction(
        swapSimulationQuery.data,
        walletAddress,
        {
          queryId,
          referralAddress,
          referralValue,
        },
      );

      await tonConnectUI.sendTransaction({
        validUntil: Date.now() + 1000000,
        messages,
      });
      toast({ title: "Transaction sent to the network" });
      setSwapTransaction({
        queryId,
        ownerAddress: walletAddress,
        routerAddress: swapSimulationQuery.data.routerAddress,
      });
    } catch {
      setSwapTransaction(null);
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

  if (!offerAsset || !askAsset) {
    return (
      <Button variant="ghost" disabled>
        Select an asset
      </Button>
    );
  }

  if (!offerAmount && !askAmount) {
    return (
      <Button variant="ghost" disabled>
        Enter an amount
      </Button>
    );
  }

  if (swapSimulationQuery.isLoading) {
    return (
      <Button variant="ghost" disabled>
        ...
      </Button>
    );
  }

  if (!swapSimulationQuery.data) {
    return <Button variant="destructive">Invalid swap</Button>;
  }

  return (
    <Button
      variant="default"
      onClick={handleSwap}
      disabled={
        isClicked ||
        swapSimulationQuery.isFetching ||
        swapStatusQuery.isFetching
      }
    >
      Swap
    </Button>
  );
}
