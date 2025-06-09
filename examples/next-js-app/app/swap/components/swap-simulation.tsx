"use client";

import { ArrowRightLeft } from "lucide-react";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { bigNumberToFloat, cn } from "@/lib/utils";

import {
  type SwapSimulation,
  useSwapSimulation,
} from "../hooks/swap-simulation-query";
import { useSwapForm } from "../providers/swap-form";

export const SwapSimulationPreview = (props: { className?: string }) => {
  const { data, error, isFetching, isFetched } = useSwapSimulation();

  if (!isFetched && !isFetching) {
    return null;
  }

  return (
    <div {...props} className={cn("p-4 border rounded-md", props.className)}>
      {error ? (
        <SwapSimulationError error={error} />
      ) : data ? (
        <SwapSimulationData data={data} />
      ) : (
        <SwapSimulationLoading />
      )}
    </div>
  );
};

const SwapSimulationError = ({ error }: { error: Error }) => {
  return (
    <div className="text-red-500 whitespace-break-spaces">
      Error: &nbsp;
      {error.message}
    </div>
  );
};

const SwapSimulationData = ({ data }: { data: SwapSimulation }) => {
  const { askAsset, offerAsset } = useSwapForm();
  const [swapRateDirection, setSwapRateDirection] = useState<
    "forward" | "reverse"
  >("forward");

  if (!askAsset || !offerAsset) {
    return null;
  }

  return (
    <ul className="space-y-2">
      <button
        type="button"
        className="border-b pb-2 flex items-center w-full gap-2"
        onClick={() =>
          setSwapRateDirection(
            swapRateDirection === "forward" ? "reverse" : "forward",
          )
        }
      >
        <pre className="w-full text-start">
          {swapRateDirection === "forward"
            ? `1 ${offerAsset.meta?.symbol} ≈ ${data.swapRate} ${askAsset.meta?.symbol}`
            : `1 ${askAsset.meta?.symbol} ≈ ${1 / Number(data.swapRate)} ${offerAsset.meta?.symbol}`}
        </pre>
        <ArrowRightLeft size={16} />
      </button>
      <li className="grid grid-cols-[max-content__1fr] gap-2">
        <b>Offer amount:</b>
        <span className="overflow-hidden text-ellipsis text-right">
          {bigNumberToFloat(data.offerUnits, offerAsset.meta?.decimals ?? 9)}
          &nbsp;
          {offerAsset.meta?.symbol}
        </span>
      </li>
      <li className="grid grid-cols-[max-content__1fr] gap-2">
        <b>Ask amount:</b>
        <span className="overflow-hidden text-ellipsis text-right">
          {bigNumberToFloat(data.askUnits, askAsset.meta?.decimals ?? 9)}
          &nbsp;
          {askAsset.meta?.symbol}
        </span>
      </li>
      <li className="grid grid-cols-[max-content__1fr] gap-2">
        <b>Ask amount (min):</b>
        <span className="overflow-hidden text-ellipsis text-right">
          {bigNumberToFloat(data.minAskUnits, askAsset.meta?.decimals ?? 9)}
          &nbsp;
          {askAsset.meta?.symbol}
        </span>
      </li>
      <li className="grid grid-cols-[max-content__1fr] gap-2">
        <b>Price impact:</b>
        <span className="overflow-hidden text-ellipsis text-right">
          {(Number(data.priceImpact) * 100).toFixed(2)}%
        </span>
      </li>
      <li className="grid grid-cols-[max-content__1fr] gap-2">
        <b>Slippage tolerance (max):</b>
        <span className="overflow-hidden text-ellipsis text-right">
          {(Number(data.slippageTolerance) * 100 * 100).toFixed(2)}%
        </span>
      </li>
    </ul>
  );
};

const SwapSimulationLoading = () => {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }, (_, i) => i).map((i) => (
        <Skeleton key={i} className="h-6" />
      ))}
    </div>
  );
};
