"use client";

import type { LiquidityProvisionSimulation } from "@ston-fi/api";

import { Skeleton } from "@/components/ui/skeleton";
import { Formatter } from "@/lib/formatter";
import { cn } from "@/lib/utils";

import { useLiquiditySimulationQuery } from "../hooks/liquidity-simulation-query";
import { useLiquidityProvideForm } from "../providers/liquidity-provide-form";

export const LiquidityProvideSimulationPreview = (props: {
  className?: string;
}) => {
  const { data, error, isFetching, isFetched } = useLiquiditySimulationQuery();

  if (!isFetched && !isFetching) {
    return null;
  }

  return (
    <div {...props} className={cn("p-4 border rounded-md", props.className)}>
      {error ? (
        <LiquidityProvideSimulationError error={error} />
      ) : data ? (
        <LiquidityProvideSimulationData data={data} />
      ) : (
        <LiquidityProvideSimulationLoading />
      )}
    </div>
  );
};

const LiquidityProvideSimulationError = ({ error }: { error: Error }) => {
  return (
    <div className="text-red-500 whitespace-break-spaces">
      Error: &nbsp;
      {"data" in error && typeof error.data === "string"
        ? error.data
        : error.message}
    </div>
  );
};

const LiquidityProvideSimulationData = ({
  data,
}: {
  data: LiquidityProvisionSimulation;
}) => {
  const { assetA, assetB, pool } = useLiquidityProvideForm();

  if (!assetA || !assetB || !pool) {
    return null;
  }

  return (
    <ul className="space-y-2">
      <li className="grid grid-cols-[max-content__1fr] gap-2">
        <b>{assetA.meta?.symbol}:</b>
        <span className="overflow-hidden text-ellipsis text-right">
          {Formatter.units(data.minTokenAUnits, assetA.meta?.decimals ?? 9)}
        </span>
      </li>
      <li className="grid grid-cols-[max-content__1fr] gap-2">
        <b>{assetB.meta?.symbol}:</b>
        <span className="overflow-hidden text-ellipsis text-right">
          {Formatter.units(data.minTokenBUnits, assetB.meta?.decimals ?? 9)}
        </span>
      </li>
      <li className="grid grid-cols-[max-content__1fr] gap-2">
        <b>Price impact:</b>
        <span className="overflow-hidden text-ellipsis text-right">
          {Formatter.percent(Number.parseFloat(data.priceImpact))}
        </span>
      </li>
    </ul>
  );
};

const LiquidityProvideSimulationLoading = () => {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }, (_, i) => i).map((i) => (
        <Skeleton key={i} className="h-6" />
      ))}
    </div>
  );
};
