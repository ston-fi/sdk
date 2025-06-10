"use server";

import { stonApiClient } from "@/lib/ston-api-client";
import { bigNumberToFloat } from "@/lib/utils";

export async function getWalletVaults(params: { userWalletAddress: string }) {
  const vaultsData = await stonApiClient.getWalletVaultsFee({
    walletAddress: params.userWalletAddress,
  });

  const uniqueAssetAddresses = Array.from(
    new Set(vaultsData.map((data) => data.assetAddress)),
  );

  const CHUNK_SIZE = 30;
  const PARALLEL_REQUESTS_LIMIT = 5;

  const detailedAssets = [];

  for (
    let i = 0;
    i < uniqueAssetAddresses.length;
    i += CHUNK_SIZE * PARALLEL_REQUESTS_LIMIT
  ) {
    const batchPromises = [];

    for (let j = 0; j < PARALLEL_REQUESTS_LIMIT; j++) {
      const chunkStart = i + j * CHUNK_SIZE;
      const chunkEnd = chunkStart + CHUNK_SIZE;
      const chunk = uniqueAssetAddresses.slice(chunkStart, chunkEnd);

      if (chunk.length > 0) {
        batchPromises.push(
          stonApiClient.queryAssets({
            condition: "false",
            unconditionalAssets: chunk,
          }),
        );
      }
    }

    const results = await Promise.all(batchPromises);

    detailedAssets.push(...results.flat());
  }

  const assetsMap = new Map(
    detailedAssets.map((asset) => [asset.contractAddress, asset]),
  );

  const vaultsDataWithTokens = vaultsData
    .map((data) => ({
      vaultAddress: data.vaultAddress,
      ownerAddress: params.userWalletAddress,
      assetAddress: data.assetAddress,
      asset: assetsMap.get(data.assetAddress),
      routerAddress: data.routerAddress,
      depositedAmount: data.balance,
    }))
    .sort((a, b) => {
      const aUsdPrice = a.asset?.dexPriceUsd;
      const bUsdPrice = b.asset?.dexPriceUsd;

      if (aUsdPrice && bUsdPrice) {
        const aAmount = a.asset
          ? Number(
              bigNumberToFloat(a.depositedAmount, a.asset.meta?.decimals ?? 9),
            )
          : 0;

        const bAmount = b.asset
          ? Number(
              bigNumberToFloat(b.depositedAmount, b.asset.meta?.decimals ?? 9),
            )
          : 0;

        return Number(bUsdPrice) * bAmount - Number(aUsdPrice) * aAmount;
      }

      if (aUsdPrice) {
        return -1;
      }

      if (bUsdPrice) {
        return 1;
      }

      return 0;
    });

  return vaultsDataWithTokens;
}
