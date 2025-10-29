"use client";

import type { PoolInfo } from "@ston-fi/api";
import {
  skipToken,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";

import { isValidAddress } from "@/lib/utils";

import { useStonApi } from "./use-ston-api";

export const POOL_QUERY_KEY = "pool";

export const usePoolQuery = <TError = Error, TData = PoolInfo>(
  poolAddress: string,
  options?: Omit<
    UseQueryOptions<PoolInfo, TError, TData>,
    "queryKey" | "queryFn"
  >,
) => {
  const client = useStonApi();

  return useQuery({
    ...options,
    queryKey: [POOL_QUERY_KEY, poolAddress],
    queryFn:
      poolAddress && isValidAddress(poolAddress)
        ? () => client.getPool(poolAddress)
        : skipToken,
  });
};
