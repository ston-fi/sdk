import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";
import { useTonAddress } from "@tonconnect/ui-react";

import { getWalletStakeInfo } from "../actions/get-wallet-stake-info";

export const walletStakeInfoQueryOptions = (
  walletAddress: string | undefined,
) =>
  queryOptions({
    queryKey: ["wallet-stake-info", `wallet:${walletAddress}`],
    queryFn: walletAddress
      ? () => getWalletStakeInfo(walletAddress)
      : skipToken,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

export const useWalletStakeInfoQuery = () => {
  const walletAddress = useTonAddress();

  return useQuery(walletStakeInfoQueryOptions(walletAddress));
};
