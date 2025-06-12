"use client";

import { RefreshCw, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLiquiditySimulationQuery } from "../hooks/liquidity-simulation-query";
import { LiquidityProvideSettings } from "./liquidity-provide-settings";

export const LiquidityProvideFormHeader = () => {
  const liquidityProvideSimulation = useLiquiditySimulationQuery();
  return (
    <div className="flex items-center gap-2">
      <h1 className="text-xl leading-8 font-medium mr-auto">
        Provide liquidity
      </h1>
      <Button
        variant="outline"
        className="size-8 p-0"
        disabled={
          !liquidityProvideSimulation.isFetched ||
          liquidityProvideSimulation.isFetching
        }
        onClick={() => liquidityProvideSimulation.refetch()}
      >
        <RefreshCw
          size={24}
          className={liquidityProvideSimulation.isLoading ? "animate-spin" : ""}
        />
      </Button>
      <LiquidityProvideSettings
        trigger={
          <Button variant="outline" className="size-8 p-0">
            <Settings size={24} />
          </Button>
        }
      />
    </div>
  );
};
