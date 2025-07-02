"use server";

import { StakeNftMinter } from "@ston-fi/stake-sdk";

import { tonApiClient } from "@/lib/ton-api-client";

import { STAKE_MINTER_ADDRESS } from "../constants";

export async function getStakeMinterData() {
  const minterContract = tonApiClient.open(
    StakeNftMinter.create(STAKE_MINTER_ADDRESS),
  );

  const minterData = await minterContract.getStakingMinterData();

  return minterData;
}
