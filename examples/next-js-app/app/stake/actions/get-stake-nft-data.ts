"use server";

import { StakeNftItem } from "@ston-fi/stake-sdk";

import { tonApiClient } from "@/lib/ton-api-client";

export async function getStakeNftData(nftAddress: string) {
  const nftContract = tonApiClient.open(StakeNftItem.create(nftAddress));

  const nftData = await nftContract.getStakingData();

  return nftData;
}
