"use client";

import { useId } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { useSwapSettings } from "../providers/swap-settings";

export const AutoSlippageSection = (
  props: React.ComponentPropsWithoutRef<"section">,
) => {
  const { autoSlippageTolerance, setAutoSlippageTolerance } = useSwapSettings();

  const controlId = useId();

  return (
    <section {...props}>
      <div className="flex flex-1 gap-4 justify-between">
        <Label htmlFor={controlId}>Auto slippage</Label>
        <Switch
          id={controlId}
          checked={autoSlippageTolerance}
          onCheckedChange={setAutoSlippageTolerance}
        />
      </div>
      <small className={"text-xs text-muted-foreground"}>
        A protective feature that may adjust your max. slippage to help your
        swap go through safely. If no adjustment is needed, your selected max.
        slippage is used.
      </small>
    </section>
  );
};
