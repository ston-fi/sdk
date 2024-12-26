"use client";

import {
  type UseQueryResult,
  skipToken,
  useQuery,
} from "@tanstack/react-query";
import {
  type SendTransactionRequest,
  useTonAddress,
} from "@tonconnect/ui-react";

import { buildVaultWithdrawalFeeTx } from "../actions/get-vault-data";

export const VAULT_WITHDRAWAL_FEE_QUERY_KEY = "vault-withdrawal-fee-params";

export const useWithdrawalFeeParams = (
  {
    routerAddress,
    tokenMinters,
  }: {
    routerAddress: string;
    tokenMinters: string[];
  },
  options?: Omit<
    UseQueryResult<SendTransactionRequest["messages"]>,
    "queryKey" | "queryFn"
  >,
) => {
  const userWalletAddress = useTonAddress();

  return useQuery({
    ...options,
    queryKey: [
      VAULT_WITHDRAWAL_FEE_QUERY_KEY,
      userWalletAddress,
      routerAddress,
      tokenMinters,
    ],
    queryFn: userWalletAddress
      ? () =>
          buildVaultWithdrawalFeeTx(
            tokenMinters.map((tokenMinter) => ({
              routerAddress,
              userWalletAddress,
              tokenMinter,
            })),
          )
      : skipToken,
  });
};
