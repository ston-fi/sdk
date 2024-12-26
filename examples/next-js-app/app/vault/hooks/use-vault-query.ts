"use client";

import {
  type UseQueryResult,
  skipToken,
  useQuery,
} from "@tanstack/react-query";
import { useTonAddress } from "@tonconnect/ui-react";

import { getVaultData } from "../actions/get-vault-data";

export const VAULT_QUERY_KEY = "vault";

type VaultData = Awaited<ReturnType<typeof getVaultData>>;

export const useVaultQuery = (
  {
    routerAddress,
    tokenMinter,
  }: {
    routerAddress: string;
    tokenMinter: string;
  },
  options?: Omit<UseQueryResult<VaultData>, "queryKey" | "queryFn">,
) => {
  const userWalletAddress = useTonAddress();

  return useQuery({
    ...options,
    queryKey: [VAULT_QUERY_KEY, userWalletAddress, routerAddress, tokenMinter],
    queryFn: userWalletAddress
      ? () => getVaultData({ userWalletAddress, routerAddress, tokenMinter })
      : skipToken,
    // retries are disabled because if the vault contract is not deployed yet
    // the getVaultData will throw an error and there is no need to retry
    retry: false,
  });
};
