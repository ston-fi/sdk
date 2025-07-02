import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";
import { useTonAddress } from "@tonconnect/ui-react";

import { getWalletStakeNft } from "../actions/get-wallet-stake-nft";

export const walletStakeNftQueryOptions = (walletAddress: string | undefined) =>
  queryOptions({
    queryKey: ["wallet-stake-nft", `wallet:${walletAddress}`],
    queryFn: walletAddress ? () => getWalletStakeNft(walletAddress) : skipToken,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

export const useWalletStakeNftQuery = () => {
  const walletAddress = useTonAddress();

  return useQuery(walletStakeNftQueryOptions(walletAddress));
};
