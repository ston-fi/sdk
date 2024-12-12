import type { SwapStatus } from "@ston-fi/api";
import {
  type UseQueryOptions,
  skipToken,
  useQuery,
} from "@tanstack/react-query";

import { useStonApi } from "@/hooks/use-ston-api";
import { AbortedPromiseError, promiseWithSignal, sleep } from "@/lib/promise";

import { useSwapTransactionDetails } from "../providers/swap-transaction";

export const SWAP_STATUS_QUERY_KEY = "swap-status";

const SWAP_STATUS_REFETCH_INTERVAL_MS = 5_000; // 5s
const SWAP_STATUS_TIMEOUT_MS = 30_0000; // 5m

export const useSwapStatusQuery = (
  options?: Omit<UseQueryOptions<SwapStatus>, "queryKey" | "queryFn">,
) => {
  const stonApi = useStonApi();
  const transactionDetails = useSwapTransactionDetails();

  return useQuery({
    ...options,
    queryKey: [SWAP_STATUS_QUERY_KEY, transactionDetails?.queryId],
    queryFn: transactionDetails
      ? async () => {
          const signal = AbortSignal.timeout(SWAP_STATUS_TIMEOUT_MS);

          let swapStatus: SwapStatus;

          do {
            swapStatus = await promiseWithSignal(
              stonApi.getSwapStatus({
                ...transactionDetails,
                queryId: transactionDetails.queryId.toString(),
              }),
              signal,
            );

            if (swapStatus["@type"] === "Found") {
              break;
            }

            await sleep(SWAP_STATUS_REFETCH_INTERVAL_MS);
          } while (swapStatus["@type"] === "NotFound");

          return swapStatus;
        }
      : skipToken,
    retry(failureCount, error) {
      if (error instanceof AbortedPromiseError) {
        return false;
      }

      return failureCount <= 3;
    },
    staleTime: Number.POSITIVE_INFINITY,
    select: (data) => (data["@type"] === "NotFound" ? null : data),
  });
};
