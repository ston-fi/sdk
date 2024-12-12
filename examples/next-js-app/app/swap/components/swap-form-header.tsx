"use client";

import { RefreshCw, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useSwapSimulation } from "../hooks/swap-simulation-query";

import { SwapSettings } from "./swap-settings";

export const SwapFormHeader = () => {
  const swapSimulationQuery = useSwapSimulation();

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-xl leading-8 font-medium mr-auto">Swap</h1>

      <Button
        variant="outline"
        className="size-8 p-0"
        disabled={
          !swapSimulationQuery.isFetched || swapSimulationQuery.isFetching
        }
        onClick={() => swapSimulationQuery.refetch()}
      >
        <RefreshCw
          size={24}
          className={swapSimulationQuery.isLoading ? "animate-spin" : ""}
        />
      </Button>
      <SwapSettings
        trigger={
          <Button variant="outline" className="size-8 p-0">
            <Settings size={24} />
          </Button>
        }
      />
    </div>
  );
};
