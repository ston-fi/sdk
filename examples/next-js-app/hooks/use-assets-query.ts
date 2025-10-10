import { type AssetInfoV2 as AssetInfo, AssetTag } from "@ston-fi/api";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { useIsConnectionRestored, useTonAddress } from "@tonconnect/ui-react";

import { useStonApi } from "./use-ston-api";

export const ASSETS_QUERY_KEY = "assets";

export type { AssetInfo };

export const useAssetsQuery = <TError = Error, TData = AssetInfo[]>(
  options?: Omit<
    UseQueryOptions<AssetInfo[], TError, TData>,
    "queryKey" | "queryFn"
  >,
) => {
  const isConnectionRestored = useIsConnectionRestored();
  const walletAddress = useTonAddress();

  const client = useStonApi();

  return useQuery({
    ...options,
    queryKey: [ASSETS_QUERY_KEY, walletAddress],
    enabled: isConnectionRestored,
    queryFn: async () => {
      const assets = await client.queryAssets({
        condition: [
          AssetTag.LiquidityVeryHigh,
          AssetTag.LiquidityHigh,
          AssetTag.WalletHasBalance,
        ].join(" | "),
        walletAddress,
      });

      return assets
        .filter((asset) => asset.meta?.symbol !== "STORM")
        .filter((asset) => asset.meta?.symbol !== "BabyDoge")
        .filter((asset) => asset.meta?.symbol !== "tsTON")
        .filter((asset) => asset.meta?.symbol !== "REDO")
        .filter((asset) => asset.meta?.symbol !== "UTYA")
        .filter((asset) => asset.meta?.symbol !== "DOGS")
        .filter((asset) => asset.meta?.symbol !== "AMORE")
        .filter((asset) => asset.meta?.symbol !== "CHERRY")
        .filter((asset) => asset.meta?.symbol !== "FPIBANK")
        .filter((asset) => asset.meta?.symbol !== "GEMSTON")
        .filter((asset) => asset.meta?.symbol !== "SP")
        .filter((asset) => asset.meta?.symbol !== "FISH")
        .filter((asset) => asset.meta?.symbol !== "ANON")
        .filter((asset) => asset.meta?.symbol !== "RAFF")
        .filter((asset) => asset.meta?.symbol !== "TPET")
        .filter((asset) => asset.meta?.symbol !== "CATS")
        .filter((asset) => asset.meta?.symbol !== "LLAMA")
        .filter((asset) => asset.meta?.symbol !== "EVAA")
        .filter((asset) => asset.meta?.symbol !== "TONG")
        .filter((asset) => asset.meta?.symbol !== "MEM")
        .filter((asset) => asset.meta?.symbol !== "SHIT")
        .filter((asset) => asset.meta?.symbol !== "tsUSDe")
        .filter((asset) => asset.meta?.symbol !== "BLUM")
        .filter((asset) => asset.meta?.symbol !== "ESIM")
        .filter((asset) => asset.meta?.symbol !== "TFT")
        .filter((asset) => asset.meta?.symbol !== "GEAR")
        .filter((asset) => asset.meta?.symbol !== "AGP")
        
        
        
        .sort((a, b) => {
        if (a.popularityIndex && b.popularityIndex) {
          return b.popularityIndex - a.popularityIndex;
        }

        if (a.popularityIndex && !b.popularityIndex) return -1;
        if (!a.popularityIndex && b.popularityIndex) return 1;

        return 0;
      });
    },
  });
};
