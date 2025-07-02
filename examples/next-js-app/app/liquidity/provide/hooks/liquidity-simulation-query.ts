"use client";

import { toUnits } from "@ston-fi/sdk";
import { skipToken, useQuery } from "@tanstack/react-query";

import { useStonApi } from "@/hooks/use-ston-api";
import {
  LiquidityProvisionType,
  useLiquidityProvideForm,
} from "../providers/liquidity-provide-form";
import { useLiquidityProvideSettings } from "../providers/liquidity-provide-settings";

export const LIQUIDITY_SIMULATION_QUERY_KEY = "liquidity-simulation";

export const useLiquiditySimulationQuery = () => {
  const stonApi = useStonApi();
  const { assetA, assetB, assetAUnits, assetBUnits, pool, provisionType } =
    useLiquidityProvideForm();
  const { slippageTolerance } = useLiquidityProvideSettings();

  return useQuery({
    queryKey: [
      LIQUIDITY_SIMULATION_QUERY_KEY,
      assetA?.contractAddress,
      assetB?.contractAddress,
      assetAUnits,
      assetBUnits,
      pool?.address,
      provisionType,
      slippageTolerance,
    ] as const,
    queryFn:
      assetA && assetB && pool && (assetAUnits || assetBUnits)
        ? async () => {
            const shared = {
              tokenA: assetA.contractAddress,
              tokenB: assetB.contractAddress,
              poolAddress: pool.address,
              slippageTolerance: slippageTolerance.toString(),
            };

            if (provisionType === LiquidityProvisionType.Arbitrary) {
              return stonApi.simulateLiquidityProvision({
                ...shared,
                provisionType,
                tokenAUnits: toUnits(
                  assetAUnits,
                  assetA.meta?.decimals ?? 9,
                ).toString(),
                tokenBUnits: toUnits(
                  assetBUnits,
                  assetB.meta?.decimals ?? 9,
                ).toString(),
              });
            }

            if (assetAUnits) {
              return stonApi.simulateLiquidityProvision({
                ...shared,
                provisionType,
                tokenAUnits: toUnits(
                  assetAUnits,
                  assetA.meta?.decimals ?? 9,
                ).toString(),
              });
            }

            if (assetBUnits) {
              return stonApi.simulateLiquidityProvision({
                ...shared,
                provisionType,
                tokenBUnits: toUnits(
                  assetBUnits,
                  assetB.meta?.decimals ?? 9,
                ).toString(),
              });
            }

            throw new Error("Unexpected form state");
          }
        : skipToken,
  });
};
