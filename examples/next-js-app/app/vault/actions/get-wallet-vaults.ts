"use server";

import { stonApiClient } from "@/lib/ston-api-client";

export async function getWalletVaults(params: { userWalletAddress: string }) {
  const vaultsData = await stonApiClient.getWalletVaultsFee({
    walletAddress: params.userWalletAddress,
  });

  return vaultsData.map((data) => ({
    vaultAddress: data.vaultAddress,
    ownerAddress: params.userWalletAddress,
    tokenAddress: data.assetAddress,
    routerAddress: data.routerAddress,
    depositedAmount: data.balance,
  }));
}
