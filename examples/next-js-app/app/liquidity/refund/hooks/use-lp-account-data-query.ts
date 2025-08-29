import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";

import { getLpAccountData } from "../actions/get-lp-account-state";
import { useLiquidityRefundForm } from "../providers/liquidity-refund-form";

export const lpAccountDataQueryOptions = (
  routerAddress: string | undefined,
  lpAccountAddress: string | undefined,
) =>
  queryOptions({
    queryKey: [
      "lp-account-data",
      `router:${routerAddress}`,
      `lpAccount:${lpAccountAddress}`,
    ],
    queryFn:
      routerAddress && lpAccountAddress
        ? () => getLpAccountData(routerAddress, lpAccountAddress)
        : skipToken,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

export const useLpAccountDataQuery = () => {
  const { routerAddress, lpAccountAddress } = useLiquidityRefundForm();

  return useQuery(lpAccountDataQueryOptions(routerAddress, lpAccountAddress));
};
