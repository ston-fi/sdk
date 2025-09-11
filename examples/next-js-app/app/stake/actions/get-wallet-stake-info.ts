"use server";

import { stonApiClient } from "@/lib/ston-api-client";

export async function getWalletStakeInfo(walletAddress: string) {
  const walletStakes = await stonApiClient.getWalletStakes({
    walletAddress,
  });

  return {
    ...walletStakes,
    nfts: (walletStakes.nfts ?? []).map((nftData) => ({
      address: nftData.address,
      status: nftData.status,
      votingPower: nftData.votingPower,
      minUnstakingTimestamp: new Date(nftData.minUnstakingTimestamp),
      unstakeTimestamp: nftData.unstakeTimestamp
        ? new Date(nftData.unstakeTimestamp)
        : null,
      stakedTokens: nftData.stakedTokens,
      walletAddress: walletAddress,
      mintedGemston: nftData.mintedGemston,
      imageUrl: nftData.imageUrl,
    })),
  };
}

export type WalletStakeInfo = Awaited<ReturnType<typeof getWalletStakeInfo>>;
export type StakeNft = WalletStakeInfo["nfts"][number];
