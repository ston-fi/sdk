"use client";

import {
  skipToken,
  type UseQueryResult,
  useQuery,
} from "@tanstack/react-query";

import { getWalletVaults } from "../actions/get-wallet-vaults";
import { useVaultClaimParams } from "../providers";

export const VAULT_QUERY_KEY = "vault";

type VaultData = Awaited<ReturnType<typeof getWalletVaults>>;

export const useWalletVaultsQuery = (
  options?: Omit<UseQueryResult<VaultData>, "queryKey" | "queryFn">,
) => {
  const { walletAddress: userWalletAddress } = useVaultClaimParams();

  return useQuery({
    ...options,
    queryKey: [VAULT_QUERY_KEY, userWalletAddress],
    queryFn: userWalletAddress
      ? () => getWalletVaults({ userWalletAddress })
      : skipToken,
  });
};
