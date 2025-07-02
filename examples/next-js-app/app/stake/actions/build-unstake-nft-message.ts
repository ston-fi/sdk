"use server";

import { StakeNftItem } from "@ston-fi/stake-sdk";
import type { SendTransactionRequest } from "@tonconnect/ui-react";

import { tonApiClient } from "@/lib/ton-api-client";

export async function buildUnstakeNftMessage(
  nftAddress: string,
): Promise<SendTransactionRequest["messages"][number]> {
  const nftContract = tonApiClient.open(StakeNftItem.create(nftAddress));
  const txParams = await nftContract.getUnstakeTxParams();

  return {
    address: txParams.to.toString(),
    amount: txParams.value.toString(),
    payload: txParams.body?.toBoc().toString("base64"),
  };
}
