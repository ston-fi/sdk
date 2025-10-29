import type { SwapSimulation } from "@ston-fi/api";
import { toUnits } from "@ston-fi/sdk";
import {
  skipToken,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import { useTonAddress } from "@tonconnect/ui-react";

import { useStonApi } from "@/hooks/use-ston-api";

import { useSwapForm } from "../providers/swap-form";
import { useSwapSettings } from "../providers/swap-settings";
import { useSwapStatusQuery } from "./swap-status-query";

export type { SwapSimulation };

export const SWAP_SIMULATION_QUERY_KEY = "swap-simulation";

export function useSwapSimulation(
  options?: Omit<UseQueryOptions<SwapSimulation>, "queryKey" | "queryFn">,
) {
  const swapFormState = useSwapForm();
  const stonApi = useStonApi();
  const { slippageTolerance } = useSwapSettings();
  const swapStatusQuery = useSwapStatusQuery();

  const walletAddress = useTonAddress();

  return useQuery({
    refetchInterval: 30 * 1000, // update every 30 seconds
    ...options,
    queryKey: [
      SWAP_SIMULATION_QUERY_KEY,
      swapFormState,
      walletAddress,
      slippageTolerance,
    ],
    queryFn:
      !swapStatusQuery.isFetching &&
      swapFormState.askAsset &&
      swapFormState.offerAsset &&
      (swapFormState.askAmount || swapFormState.offerAmount)
        ? async () => {
            const {
              askAsset,
              offerAsset,
              askAmount,
              offerAmount,
              referralAddress,
              referralValue,
            } = swapFormState;

            const shared = {
              referralAddress,
              referralFeeBps:
                referralAddress && referralValue
                  ? referralValue.toString()
                  : undefined,
              slippageTolerance: slippageTolerance.toString(),
              dexV2: true,
            } as const;

            if (offerAsset && offerAmount && askAsset) {
              return stonApi.simulateSwap({
                ...shared,
                offerAddress: offerAsset.contractAddress,
                offerUnits: toUnits(
                  offerAmount,
                  offerAsset.meta?.decimals ?? 9,
                ).toString(),
                askAddress: askAsset.contractAddress,
              });
            }

            if (offerAsset && askAsset && askAmount) {
              return stonApi.simulateReverseSwap({
                ...shared,
                offerAddress: offerAsset.contractAddress,
                askAddress: askAsset.contractAddress,
                askUnits: toUnits(
                  askAmount,
                  askAsset.meta?.decimals ?? 9,
                ).toString(),
              });
            }

            throw new Error("Invalid swap form state.");
          }
        : skipToken,
  });
}
