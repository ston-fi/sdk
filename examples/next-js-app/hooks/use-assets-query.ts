import { type AssetInfoV2 as AssetInfo, AssetTag } from "@ston-fi/api";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { useIsConnectionRestored, useTonAddress } from "@tonconnect/ui-react";

import { useStonApi } from "./use-ston-api";

export const ASSETS_QUERY_KEY = "assets";

export type { AssetInfo };

export const useAssetsQuery = (
  options?: Omit<UseQueryOptions<AssetInfo[]>, "queryKey" | "queryFn">,
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
        walletAddress,
      });

      return assets;
    },
  });
};
