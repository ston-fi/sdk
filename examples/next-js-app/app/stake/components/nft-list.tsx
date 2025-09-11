import { useQuery } from "@tanstack/react-query";
import { useTonAddress } from "@tonconnect/ui-react";
import type React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { WalletStakeInfo } from "../actions/get-wallet-stake-info";
import { walletStakeInfoQueryOptions } from "../hooks/use-wallet-stake-nft-query";

import { NftListItem } from "./nft-list-item";

export function NftList({
  nftSelector,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  nftSelector: (nfts: WalletStakeInfo["nfts"]) => WalletStakeInfo["nfts"];
}) {
  const walletAddress = useTonAddress();

  const { data, error, isLoading, isFetched } = useQuery({
    ...walletStakeInfoQueryOptions(walletAddress),
    select: (raw) => nftSelector(raw.nfts),
  });

  if (isLoading || !isFetched) {
    return (
      <div
        {...props}
        className={cn(
          "grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
          props.className,
        )}
      >
        <Skeleton className="h-40 max-h-[100px]" />
        <Skeleton className="h-40 max-h-[100px]" />
        <Skeleton className="h-40 max-h-[100px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div {...props}>
        <pre className="text-red-500 whitespace-pre-wrap">
          Error loading NFTs: {error.message}
        </pre>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div {...props}>
        <p>No NFTs found.</p>
      </div>
    );
  }

  return (
    <div
      {...props}
      className={cn(
        "grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        props.className,
      )}
    >
      {data.map((nft) => (
        <NftListItem key={nft.address} nft={nft} />
      ))}
    </div>
  );
}
