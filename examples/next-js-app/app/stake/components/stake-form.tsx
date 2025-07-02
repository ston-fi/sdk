import { fromUnits, toUnits } from "@ston-fi/sdk";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WalletGuard } from "@/components/wallet-guard";
import { cn } from "@/lib/utils";

import { buildStakeMessage } from "../actions/build-stake-message";
import { useStakeForm } from "../providers/stake-form";

export function StakeForm(
  props: Omit<React.ComponentProps<"div">, "children">,
) {
  const inputId = useRef("stake-amount");
  const durationId = useRef("stake-duration");

  const [tonConnectUI] = useTonConnectUI();

  return (
    <Card {...props}>
      <CardContent className="flex flex-col gap-4 p-6">
        <label htmlFor={inputId.current}>Amount:</label>
        <StakeFormAmount id={inputId.current} />

        <label htmlFor={durationId.current}>Duration:</label>
        <StakeFormDuration id={durationId.current} />
      </CardContent>
      <CardFooter>
        <WalletGuard
          fallback={
            <Button onClick={() => tonConnectUI.openModal()} className="w-full">
              Connect wallet
            </Button>
          }
        >
          <StakeFormSubmitButton className="w-full" />
        </WalletGuard>
      </CardFooter>
    </Card>
  );
}

function stringToBn(value: string): bigint | undefined {
  if (!value) return undefined;

  return toUnits(value, 9);
}

function StakeFormAmount(
  props: Omit<React.ComponentProps<"input">, "value" | "onChange">,
) {
  const { state, setAmount } = useStakeForm();

  const [value, setValue] = useState(
    state.amount === undefined ? "" : fromUnits(state.amount, 9),
  );

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => {
        const newValue = e.target.value;

        setValue(newValue);

        if (newValue === "") {
          setAmount(undefined);
        } else if (newValue === ".") {
          return;
        } else {
          setAmount(stringToBn(newValue));
        }
      }}
    />
  );
}

const STAKE_FORM_DURATION_OPTIONS = [3, 6, 12, 24];

function StakeFormDuration(
  props: Omit<React.ComponentProps<"div">, "children">,
) {
  const { state, setDurationMonths } = useStakeForm();

  return (
    <div
      {...props}
      className={cn("inline-flex items-center gap-2", props.className)}
    >
      {STAKE_FORM_DURATION_OPTIONS.map((option) => (
        <Button
          key={option}
          variant={state.durationMonths === option ? "outline" : "ghost"}
          onClick={() => setDurationMonths(option)}
          className="px-4 w-1/4"
        >
          {option} months
        </Button>
      ))}
    </div>
  );
}

function StakeFormSubmitButton(
  props: Omit<React.ComponentProps<typeof Button>, "children">,
) {
  const { state } = useStakeForm();

  const walletAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const canSubmitStake = state.amount !== undefined && state.amount > 0n;

  return (
    <Button
      {...props}
      disabled={props.disabled || !canSubmitStake}
      onClick={async () => {
        if (!canSubmitStake) return;

        const message = await buildStakeMessage(
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          state.amount!,
          state.durationMonths,
          walletAddress,
        );

        await tonConnectUI.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 5 * 60, // 5 minutes
          messages: [message],
        });
      }}
    >
      Stake
    </Button>
  );
}
