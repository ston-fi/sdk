"use server";

import { StakeNftItem } from "@ston-fi/stake-sdk";
import type { SendTransactionRequestWithMessages } from "@tonconnect/ui-react";

import { tonApiClient } from "@/lib/ton-api-client";

export async function buildDestroyNftMessage(
  nftAddress: string,
): Promise<SendTransactionRequestWithMessages["messages"][number]> {
  const nftContract = tonApiClient.open(StakeNftItem.create(nftAddress));
  const txParams = await nftContract.getDestroyTxParams();

  return {
    address: txParams.to.toString(),
    amount: txParams.value.toString(),
    payload: txParams.body?.toBoc().toString("base64"),
  };
}
