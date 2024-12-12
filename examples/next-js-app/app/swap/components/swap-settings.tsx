"use client";

import { useId } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  SLIPPAGE_TOLERANCE_OPTIONS,
  useSwapSettings,
} from "../providers/swap-settings";

export function SwapSettings({
  trigger = (
    <Button variant="outline" className="w-fit">
      Settings
    </Button>
  ),
}: {
  trigger?: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Swap Settings</DialogTitle>
        </DialogHeader>
        <SlippageToleranceSection />
      </DialogContent>
    </Dialog>
  );
}

const transformValue = (value: number) => value * 100;
const transformValueBack = (value: number) => value / 100;

const SlippageToleranceSection = () => {
  const { slippageTolerance, setSlippageTolerance } = useSwapSettings();

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
