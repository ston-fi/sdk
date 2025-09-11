import { useTonConnectUI } from "@tonconnect/ui-react";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBlockchainExplorer } from "@/hooks/use-blockchain-explorer";
import { Formatter } from "@/lib/formatter";
import { cn } from "@/lib/utils";

import { buildDestroyNftMessage } from "../actions/build-destroy-nft-message";
import { buildUnstakeNftMessage } from "../actions/build-unstake-nft-message";
import type { StakeNft } from "../actions/get-wallet-stake-info";
import { StakeNftStatus } from "../constants";

export function NftListItem({
  nft,
  ...props
}: React.ComponentProps<typeof Card> & {
  nft: StakeNft;
}) {
  const [tonConnectUI] = useTonConnectUI();
  const blockchainExplorer = useBlockchainExplorer();

  return (
    <Card {...props}>
      <CardHeader>
        <div className="inline-flex items-center gap-4">
          <img
            src={nft.imageUrl}
            alt={`NFT ${nft.address} preview`}
            className="size-[60px] rounded-xl"
          />

          <div className="w-full flex flex-col gap-1">
            <a
              href={blockchainExplorer.contract(nft.address)}
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-primary"
            >
              <h4 className="w-full gap-1 flex items-center">
                {Formatter.address(nft.address)}
                <ExternalLink className="size-4" />
              </h4>
            </a>
            <p className="truncate">
              <small>{nft.minUnstakingTimestamp.toLocaleString()}</small>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="w-full text-sm">
          <div className="flex items-center justify-between">
            <p className="font-medium whitespace-nowrap truncate">
              {nft.status === StakeNftStatus.Active ? "Staked:" : "Ex. staked:"}
            </p>
            <p className="text-end">
              {Formatter.units(nft.stakedTokens, 9)} STON
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium whitespace-nowrap truncate">Earned:</p>
            <p className="text-end">
              {Formatter.units(nft.mintedGemston, 9)} GEMSTON
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        {(() => {
          switch (nft.status) {
            case StakeNftStatus.Unstaked: {
              return (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={async () => {
                    const message = await buildDestroyNftMessage(nft.address);

                    await tonConnectUI.sendTransaction({
                      validUntil: Math.floor(Date.now() / 1000) + 5 * 60, // 5 minutes
                      messages: [message],
                    });
                  }}
                >
                  Destroy NFT
                </Button>
              );
            }
            case StakeNftStatus.Active: {
              const buttonProps = {
                className: "w-full",
                variant: "outline",
                children: "Unstake NFT",
              } as const;

              if (nft.minUnstakingTimestamp > new Date()) {
                return (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        {...buttonProps}
                        className={cn(
                          "opacity-50 cursor-help",
                          buttonProps.className,
                        )}
                      />
                    </PopoverTrigger>
                    <PopoverContent>
                      <p>
                        Unstake available after{" "}
                        {nft.minUnstakingTimestamp.toLocaleString()}
                      </p>
                    </PopoverContent>
                  </Popover>
                );
              }

              return (
                <Button
                  {...buttonProps}
                  onClick={async () => {
                    const message = await buildUnstakeNftMessage(nft.address);

                    await tonConnectUI.sendTransaction({
                      validUntil: Math.floor(Date.now() / 1000) + 5 * 60, // 5 minutes
                      messages: [message],
                    });
                  }}
                />
              );
            }
            default: {
              return null;
            }
          }
        })()}
      </CardFooter>
    </Card>
  );
}
