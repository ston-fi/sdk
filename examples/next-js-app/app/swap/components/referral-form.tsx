"use client";

import type React from "react";
import { useId, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouters } from "@/hooks/use-routers";
import {
  cn,
  isValidAddress,
  percentToBps,
  validateFloatValue,
} from "@/lib/utils";
import {
  DEFAULT_REFERRAL_VALUE_PERCENT,
  MAX_REFERRAL_VALUE_PERCENT,
  MIN_REFERRAL_VALUE_PERCENT,
} from "../constants";
import { useSwapSimulation } from "../hooks/swap-simulation-query";
import { useSwapForm, useSwapFormDispatch } from "../providers/swap-form";

export const ReferralForm = () => {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6">
        <section className="flex flex-col gap-2">
          <ReferralAddressInput />
          <ReferralValueInput />
        </section>
        <ReferralValueDisclaimer />
      </CardContent>
    </Card>
  );
};

const ReferralAddressInput: React.FC<
  Omit<React.ComponentPropsWithoutRef<"div">, "children">
> = (props) => {
  const id = useId();
  const dispatch = useSwapFormDispatch();
  const [isValid, setIsValid] = useState(true);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    const isValidTonAddress = isValidAddress(target.value);
    dispatch({
      type: "SET_REFERRAL_ADDRESS",
      payload: isValidTonAddress ? target.value : undefined,
    });
    setIsValid(!target.value || isValidTonAddress);
  };

  return (
    <div
      {...props}
      className={cn("flex flex-col gap-1 w-full", props.className)}
    >
      <label className="text-sm" htmlFor={id}>
        Referral address:
      </label>
      <Input
        className={cn("placeholder:text-secondary/1", {
          "border-[red]": !isValid,
        })}
        placeholder="EQ…"
        id={id}
        name="referral_address"
        onChange={handleChange}
      />
    </div>
  );
};

const validateReferralValue = (value: string) => {
  const valueAsNumber = Number.parseFloat(value);

  if (Number.isNaN(valueAsNumber)) {
    return false;
  }

  return (
    valueAsNumber >= MIN_REFERRAL_VALUE_PERCENT &&
    valueAsNumber <= MAX_REFERRAL_VALUE_PERCENT
  );
};

const ReferralValueInput: React.FC<
  Omit<React.ComponentPropsWithoutRef<"div">, "children">
> = (props) => {
  const id = useId();
  const { referralAddress } = useSwapForm();
  const [referralValue, setReferralValue] = useState("");
  const dispatch = useSwapFormDispatch();
  const isValidReferralValue =
    !referralValue || validateReferralValue(referralValue);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    if (target.value && !validateFloatValue(target.value, 2)) return;

    setReferralValue(target.value);
    dispatch({
      type: "SET_REFERRAL_VALUE",
      payload: validateReferralValue(target.value)
        ? percentToBps(Number.parseFloat(target.value) / 100)
        : undefined,
    });
  };

  return (
    <div
      {...props}
      className={cn("flex flex-col gap-1 w-full", props.className)}
    >
      <label className="text-sm" htmlFor={id}>
        Referral percentage:
      </label>
      <Input
        className={cn("placeholder:text-secondary/1", {
          "border-[red]": !isValidReferralValue,
        })}
        placeholder="EQ…"
        id={id}
        name="referral_percentage"
        onChange={handleChange}
        value={referralValue}
        disabled={!referralAddress}
      />
      {!isValidReferralValue && (
        <span className="text-xs text-[red]">
          Invalid referral percentage (default {DEFAULT_REFERRAL_VALUE_PERCENT}%
          will be used)
        </span>
      )}
    </div>
  );
};

const ReferralValueDisclaimer = () => {
  const { data: routers } = useRouters();
  const { data: swapSimulation } = useSwapSimulation();
  const { referralValue, referralAddress } = useSwapForm();
  const router = swapSimulation
    ? routers?.get(swapSimulation.routerAddress)
    : null;

  if (!referralValue || !referralAddress || router?.majorVersion !== 1) {
    return null;
  }

  return (
    <div className="text-sm text-[red]">
      Custom referral value cannot be applied since swap will be performed via
      v1 contracts (default {DEFAULT_REFERRAL_VALUE_PERCENT}% will be used)
    </div>
  );
};
