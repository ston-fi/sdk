"use client";

import { SlippageToleranceSection } from "@/components/slippage-tolerance-section";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const { slippageTolerance, setSlippageTolerance } = useSwapSettings();

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Swap Settings</DialogTitle>
        </DialogHeader>
        <SlippageToleranceSection
          slippageTolerance={slippageTolerance}
          onSlippageChange={setSlippageTolerance}
          slippageTolerancePresetItems={SLIPPAGE_TOLERANCE_OPTIONS}
        />
      </DialogContent>
    </Dialog>
  );
}
