"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useAssetsQuery } from "@/hooks/use-assets-query";

import { useBlockchainExplorer } from "@/hooks/use-blockchain-explorer";
import { bigNumberToFloat, cn } from "@/lib/utils";

import { useWalletVaultsQuery } from "../hooks/use-wallet-vaults-query";
import { useVaultClaimParams } from "../providers";

import { ClaimWithdrawalFeeButton } from "./claim-fee-button";

const VaultInfo: React.FC<
  Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
    vaultAddress: string;
    routerAddress: string;
    tokenMinter: string;
    depositedAmount: string;
  }
> = ({
  vaultAddress,
  routerAddress,
  tokenMinter,
  depositedAmount,
  ...props
}) => {
  const { data: assetInfo } = useAssetsQuery({
    select: (data) =>
      data.find(({ contractAddress }) => contractAddress === tokenMinter),
  });

  const blockchainExplorer = useBlockchainExplorer();

  return (
    <Card {...props} className={cn("min-h-[144px]", props.className)}>
      <CardContent className="p-4 h-full">
        <ul className="space-y-2">
          <li className="grid grid-cols-[max-content__1fr] gap-2">
            <b>Vault: </b>
            <a
              href={blockchainExplorer.contract(vaultAddress)}
              target="_blank"
              rel="noreferrer"
              className="overflow-hidden text-ellipsis text-right underline"
            >
              {`${vaultAddress.slice(0, 4)}…${vaultAddress.slice(-4)}`}
            </a>
          </li>

          <li className="grid grid-cols-[max-content__1fr] gap-2">
            <b>Amount:</b>
            <span className="overflow-hidden text-ellipsis text-right">
              {bigNumberToFloat(
                depositedAmount,
                assetInfo?.meta?.decimals ?? 9,
              )}
              &nbsp;
              {assetInfo?.meta?.symbol}
            </span>
          </li>
        </ul>

        <ClaimWithdrawalFeeButton
          className="mt-4 w-full"
          routerAddress={routerAddress}
          tokenMinters={[tokenMinter]}
        >
          Claim
        </ClaimWithdrawalFeeButton>
      </CardContent>
    </Card>
  );
};

export const WalletVaultsInfo: React.FC<
  Omit<React.ComponentPropsWithoutRef<"div">, "children">
> = () => {
  const { walletAddress } = useVaultClaimParams();
  const walletVaultsQuery = useWalletVaultsQuery();

  if (!walletAddress) {
    return null;
  }

  if (!walletVaultsQuery.data) {
    return <div>Fetching vaults...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {walletVaultsQuery.data.map((vault) => (
          <VaultInfo
            key={vault.vaultAddress}
            vaultAddress={vault.vaultAddress}
            routerAddress={vault.routerAddress}
            tokenMinter={vault.tokenAddress}
            depositedAmount={vault.depositedAmount}
          />
        ))}
      </div>
    </>
  );
};
