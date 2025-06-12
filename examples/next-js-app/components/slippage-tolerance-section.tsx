"use client";

import { useId } from "react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const transformValue = (value: number) => value * 100;
const transformValueBack = (value: number) => value / 100;

export const SlippageToleranceSection: React.FC<{
  slippageTolerance: number;
  onSlippageChange: (value: number) => void;
  slippageTolerancePresetItems: readonly number[];
}> = ({
  slippageTolerance,
  onSlippageChange,
  slippageTolerancePresetItems,
}) => {
  const inputId = useId();

  return (
    <section className="flex space-x-2 items-end">
      <div className="grid items-center gap-1.5 w-full">
        <Label htmlFor={inputId}>Slippage Tolerance</Label>
        <Input
          id={inputId}
          type="number"
          value={transformValue(slippageTolerance)}
          onChange={(e) =>
            onSlippageChange(
              transformValueBack(Number.parseFloat(e.target.value)),
            )
          }
        />
      </div>
      {slippageTolerancePresetItems.map((value) => (
        <Button
          key={value}
          variant={value === slippageTolerance ? "default" : "secondary"}
          onClick={() => onSlippageChange(value)}
        >
          {transformValue(value)}%
        </Button>
      ))}
    </section>
  );
};
