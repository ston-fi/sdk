"use client";

import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";

import { Button } from "@/components/ui/button";
import { isSameAddress } from "@/lib/utils";

import { buildLpRefundMessages } from "../actions/build-lp-refund-messages";
import { useLpAccountDataQuery } from "../hooks/use-lp-account-data-query";

export const LiquidityRefundButton = (props: { className?: string }) => {
  const walletAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const { data, isLoading, isFetched } = useLpAccountDataQuery();

  if (!isLoading && !isFetched) {
    return null;
  }

  if (!walletAddress) {
    return (
      <Button variant="secondary" onClick={() => tonConnectUI.openModal()}>
        Connect wallet
      </Button>
    );
  }

  if (!data) {
    return (
      <Button variant="secondary" onClick={() => tonConnectUI.openModal()}>
        Loading...
      </Button>
    );
  }

  if (!isSameAddress(data.userAddress, walletAddress)) {
    return (
      <Button variant="secondary" disabled className={props.className}>
        Not an owner of this LP account
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      className={props.className}
      onClick={async () => {
        const messages = await buildLpRefundMessages(data);

        await tonConnectUI.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 5 * 60, // 5 minutes
          messages,
        });
      }}
    >
      Refund
    </Button>
  );
};
