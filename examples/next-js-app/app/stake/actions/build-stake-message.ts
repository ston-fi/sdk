"use server";

import { StakeNftMinter } from "@ston-fi/stake-sdk";
import type { SendTransactionRequest } from "@tonconnect/ui-react";

import { tonApiClient } from "@/lib/ton-api-client";

import {
  MONTH_IN_SECONDS,
  STAKE_MAX_DURATION_MONTH,
  STAKE_MINTER_ADDRESS,
  STAKE_MIN_DURATION_MONTH,
  STAKE_TOKEN_ADDRESS,
} from "../constants";

export async function buildStakeMessage(
  amount: bigint,
  durationMonths: number,
  walletAddress: string,
): Promise<SendTransactionRequest["messages"][number]> {
  if (amount <= 0n) {
    throw new Error("Amount must be greater than zero");
  }

  if (durationMonths < STAKE_MIN_DURATION_MONTH) {
    throw new Error(
      `Duration must be at least ${STAKE_MIN_DURATION_MONTH} months`,
    );
  }

  if (durationMonths > STAKE_MAX_DURATION_MONTH) {
    throw new Error(
      `Duration must not exceed ${STAKE_MAX_DURATION_MONTH} months`,
    );
  }

  const nftContract = tonApiClient.open(
    StakeNftMinter.create(STAKE_MINTER_ADDRESS),
  );

  const txParams = await nftContract.getStakeTxParams({
    jettonAmount: amount,
    jettonAddress: STAKE_TOKEN_ADDRESS,
    userWalletAddress: walletAddress,
    durationSeconds: durationMonths * MONTH_IN_SECONDS,
  });

  return {
    address: txParams.to.toString(),
    amount: txParams.value.toString(),
    payload: txParams.body?.toBoc().toString("base64"),
  };
}
