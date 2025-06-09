"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useAssetsQuery } from "@/hooks/use-assets-query";
import { useBlockchainExplorer } from "@/hooks/use-blockchain-explorer";
import { usePoolQuery } from "@/hooks/use-pool-query";
import { useRouters } from "@/hooks/use-routers";
import { bigNumberToFloat, cn } from "@/lib/utils";

import { useVaultQuery } from "../hooks/use-vault-query";
import { useVaultClaimParams } from "../providers";

import { ClaimBothFeeButton } from "./claim-both-fee-button";
import { ClaimWithdrawalFeeButton } from "./claim-fee-button";

const VaultInfo: React.FC<
  Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
    routerAddress: string;
    tokenMinter: string;
  }
> = ({ routerAddress, tokenMinter, ...props }) => {
  const vaultQuery = useVaultQuery({ routerAddress, tokenMinter });
  const { data: assetInfo } = useAssetsQuery({
    select: (data) =>
      data.find(({ contractAddress }) => contractAddress === tokenMinter),
  });

  const blockchainExplorer = useBlockchainExplorer();

  return (
    <Card {...props} className={cn("min-h-[144px]", props.className)}>
      <CardContent className="p-4 h-full">
        {vaultQuery.isError ? (
          <div className="flex items-center justify-center h-full">
            {assetInfo?.meta?.symbol} vault data not found
          </div>
        ) : !vaultQuery.data ? (
          <div className="flex items-center justify-center h-full">
            Loading {assetInfo?.meta?.symbol} vault data…
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              <li className="grid grid-cols-[max-content__1fr] gap-2">
                <b>Vault: </b>
                <a
                  href={blockchainExplorer.contract(
                    vaultQuery.data.vaultAddress,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="overflow-hidden text-ellipsis text-right underline"
                >
                  {`${vaultQuery.data.vaultAddress.slice(0, 4)}…${vaultQuery.data.vaultAddress.slice(-4)}`}
                </a>
              </li>

              <li className="grid grid-cols-[max-content__1fr] gap-2">
                <b>Amount:</b>
                <span className="overflow-hidden text-ellipsis text-right">
                  {bigNumberToFloat(
                    vaultQuery.data.depositedAmount,
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const PoolVaultsInfo: React.FC<
  Omit<React.ComponentPropsWithoutRef<"div">, "children">
> = () => {
  const { poolAddress, walletAddress } = useVaultClaimParams();
  const routersQuery = useRouters();
  const poolQuery = usePoolQuery(poolAddress);

  if (!poolAddress || !walletAddress) {
    return null;
  }

  if (!poolQuery.data) {
    return <div>Fetching pool...</div>;
  }

  if (routersQuery.isFetching) {
    return <div>Fetching router...</div>;
  }

  const router = routersQuery.data?.get(poolQuery.data.routerAddress) ?? null;

  if (!router) {
    return <div className="text-red-500">Unknown Router</div>;
  }

  if (router.majorVersion === 1) {
    return (
      <div className="text-red-500">
        Vault contract does not exist in DEX v1
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <VaultInfo
          routerAddress={poolQuery.data.routerAddress}
          tokenMinter={poolQuery.data.token0Address}
        />
        <VaultInfo
          routerAddress={poolQuery.data.routerAddress}
          tokenMinter={poolQuery.data.token1Address}
        />
      </div>

      <ClaimBothFeeButton className="w-full" pool={poolQuery.data}>
        Claim both
      </ClaimBothFeeButton>
    </>
  );
};
