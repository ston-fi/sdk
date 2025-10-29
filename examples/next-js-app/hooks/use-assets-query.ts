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
          AssetTag.LiquidityMedium,
          AssetTag.WalletHasBalance,
        ].join(" | "),
        walletAddress: walletAddress || undefined,
      });

      return assets.sort((a, b) => {
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
