"use server";

import { Address } from "@ton/ton";

import { tonConsoleClient } from "@/lib/ton-console-client";

import { getStakeNftData } from "./get-stake-nft-data";

import { STAKE_MINTER_ADDRESS } from "../constants";

export async function getWalletStakeNft(walletAddress: string) {
  const nft = await tonConsoleClient.accounts.getAccountNftItems(
    Address.parse(walletAddress),
    {
      collection: Address.parse(STAKE_MINTER_ADDRESS),
    },
  );

  const nftData = await Promise.all(
    nft.nftItems.map(async (nftItem) => {
      const nftStakeData = await getStakeNftData(nftItem.address.toString());

      return {
        ...nftStakeData,
        address: nftItem.address.toString(),
        index: nftItem.index,
        image_url: nftItem.previews?.[1]?.url,
      };
    }),
  );

  return nftData
    .sort((a, b) => a.index - b.index)
    .map((nftData) => ({
      address: nftData.address,
      index: nftData.index,
      status: nftData.status,
      vote_power: nftData.vote_power,
      min_unstake_date: new Date(Number(nftData.min_unstake_date) * 1000),
      lock_date: new Date(Number(nftData.lock_date) * 1000),
      staked_tokens: nftData.staked_tokens,
      owner_address: nftData.owner_address.toString(),
      minted_gemston: nftData.secondary_tokens_minted,
      image_url: nftData.image_url,
    }));
}

export type StakeNftData = Awaited<
  ReturnType<typeof getWalletStakeNft>
>[number];
