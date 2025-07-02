"use client";

import { WalletGuard } from "@/components/wallet-guard";

import { NftList } from "./components/nft-list";
import { StakeForm } from "./components/stake-form";
import { StakeNftItemStatus } from "./constants";
import { StakeFormProvider } from "./providers/stake-form";

export default function StakePage() {
  return (
    <section className="mx-auto max-w-[900px] w-full pt-4 md:pt-12 flex flex-col gap-4">
      <div className="max-w-[500px] w-full mx-auto space-y-4">
        <h1 className="text-xl leading-8 font-medium mr-auto">
          Stake your STON
        </h1>
        <StakeFormProvider>
          <StakeForm />
        </StakeFormProvider>
      </div>

      <WalletGuard
        fallback={
          <p className="text-lg text-center">
            Connect your wallet to see your NFTs.
          </p>
        }
      >
        <div className="space-y-4 text-lg">
          <h2>Active NFTs</h2>
          <NftList
            nftSelector={(nfts) =>
              nfts
                .filter((nft) => nft.status === StakeNftItemStatus.ACTIVE)
                .sort(
                  (a, b) =>
                    a.min_unstake_date.getTime() - b.min_unstake_date.getTime(),
                )
            }
          />
        </div>

        <div className="space-y-4 text-lg">
          <h3>Unstaked NFTs</h3>
          <NftList
            nftSelector={(nfts) =>
              nfts
                .filter((nft) => nft.status === StakeNftItemStatus.UNSTAKED)
                .sort((a, b) => a.lock_date.getTime() - b.lock_date.getTime())
            }
          />
        </div>
      </WalletGuard>
    </section>
  );
}
