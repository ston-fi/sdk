"use client";

import { useId } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import {
  SLIPPAGE_TOLERANCE_OPTIONS,
  useLiquidityProvideSettings,
} from "../providers/liquidity-provide-settings";

const transformValue = (value: number) => value * 100;
const transformValueBack = (value: number) => value / 100;

export const SlippageToleranceSection = (
  props: React.ComponentPropsWithoutRef<"section">,
) => {
  const { slippageTolerance, setSlippageTolerance } =
    useLiquidityProvideSettings();
  const inputId = useId();

  return (
    <section
      {...props}
      className={cn("flex space-x-2 items-end", props.className)}
    >
      <div className="grid items-center gap-1.5 w-full">
        <Label htmlFor={inputId}>Slippage Tolerance</Label>
        <Input
          id={inputId}
          type="number"
          value={transformValue(slippageTolerance)}
          onChange={(e) =>
            setSlippageTolerance(
              transformValueBack(Number.parseFloat(e.target.value)),
            )
          }
        />
      </div>
      {SLIPPAGE_TOLERANCE_OPTIONS.map((value) => (
        <Button
          key={value}
          variant={value === slippageTolerance ? "default" : "secondary"}
          onClick={() => setSlippageTolerance(value)}
        >
          {transformValue(value)}%
        </Button>
      ))}
    </section>
  );
};
