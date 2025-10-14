"use client";

import { ExternalLink } from "lucide-react";
import { useMemo } from "react";

import { Card } from "@/components/ui/card";
import { useBlockchainExplorer } from "@/hooks/use-blockchain-explorer";
import { Formatter } from "@/lib/formatter";
import { cn } from "@/lib/utils";

import { useWalletVaultsQuery } from "../hooks/use-wallet-vaults-query";

import { ClaimWithdrawalFeeButton } from "./claim-fee-button";

type VaultInfo = NonNullable<
  ReturnType<typeof useWalletVaultsQuery>["data"]
>[number];

export const VaultList = (
  props: Omit<React.ComponentPropsWithoutRef<"div">, "children">,
) => {
  const { isFetched, isFetching, data, error } = useWalletVaultsQuery();

  if (!isFetched && !isFetching) {
    return null;
  }

  if (isFetching) {
    return <div {...props}>Loading vaults…</div>;
  }

  if (error) {
    return <div {...props}>Error fetching vaults: {error.message}</div>;
  }

  if (!data || data.length === 0) {
    return <div {...props}>No vaults found</div>;
  }

  return (
    <div {...props} className={cn("flex flex-col gap-4", props.className)}>
      {data.map((vault) => (
        <VaultListItem key={vault.vaultAddress} vault={vault} />
      ))}
    </div>
  );
};

const VaultListItem: React.FC<
  Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
    vault: Pick<
      VaultInfo,
      | "vaultAddress"
      | "routerAddress"
      | "assetAddress"
      | "asset"
      | "depositedAmount"
    >;
  }
> = ({ vault, ...props }) => {
  const blockchainExplorer = useBlockchainExplorer();

  const amount = useMemo(() => {
    const decimals = vault.asset?.meta?.decimals ?? 9;

    return Formatter.units(vault.depositedAmount, decimals);
  }, [vault.depositedAmount, vault.asset?.meta?.decimals]);

  const fiatAmount = useMemo(() => {
    const decimals = vault.asset?.meta?.decimals ?? 9;
    const priceUsd = Number(vault.asset?.dexPriceUsd) || 0;

    return Formatter.fiatAmount(
      (Number(vault.depositedAmount) * priceUsd) / 10 ** decimals,
      { currency: "USD" },
    );
  }, [
    vault.depositedAmount,
    vault.asset?.dexPriceUsd,
    vault.asset?.meta?.decimals,
  ]);

  return (
    <Card
      {...props}
      className={cn(
        "px-4 py-2 grid sm:grid-cols-1 md:grid-cols-[200px_auto_100px] gap-x-4 gap-y-2 items-center",
        props.className,
      )}
    >
      <p className="inline-flex">
        Vault:
        <a
          href={blockchainExplorer.contract(vault.vaultAddress)}
          target="_blank"
          rel="noreferrer"
          className="underline inline-flex items-center gap-1 ml-1 hover:text-primary"
        >
          {Formatter.address(vault.vaultAddress)}
          <ExternalLink className="size-4" />
        </a>
      </p>

      <pre className="md:text-right">
        {amount}
        &nbsp;
        {vault.asset?.meta ? (
          <a
            href={blockchainExplorer.contract(vault.assetAddress)}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-primary"
          >
            {vault.asset.meta.symbol}
          </a>
        ) : null}
        &nbsp;≈&nbsp;{fiatAmount}
      </pre>

      <ClaimWithdrawalFeeButton
        routerAddress={vault.routerAddress}
        assetAddress={vault.assetAddress}
      >
        Claim
      </ClaimWithdrawalFeeButton>
    </Card>
  );
};
