import { skipToken, useQuery } from "@tanstack/react-query";
import { type StonApiClient, useStonApi } from "./use-ston-api";

export const POOL_BY_ASSETS_QUERY_KEY = "pool-by-assets";

export const usePoolsByAssetsQuery = ({
  asset0Address,
  asset1Address,
}: Partial<Parameters<StonApiClient["getPoolsByAssetPair"]>[0]>) => {
  const client = useStonApi();

  return useQuery({
    queryKey: [POOL_BY_ASSETS_QUERY_KEY, { asset0Address, asset1Address }],
    queryFn:
      asset0Address && asset1Address
        ? async () => {
            const pools = await client.getPoolsByAssetPair({
              asset0Address,
              asset1Address,
            });

            const sortedPools = pools.sort((a, b) => {
              return Number(b.lpTotalSupply) - Number(a.lpTotalSupply);
            });

            return sortedPools;
          }
        : skipToken,
  });
};
