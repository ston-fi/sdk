"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Card } from "@/components/ui/card";
import { WalletGuard } from "@/components/wallet-guard";

import PoolAddressForm from "./components/pool-address-form";
import { PoolVaultsInfo } from "./components/vault-info";

export default function VaultPage() {
  return (
    <section className="mx-auto w-full max-w-[800px] pt-4 md:pt-12 flex flex-col gap-4">
      <section className="spaced-x-2">
        <h1 className="text-xl font-medium w-full">Vault</h1>
        <p>
          Read more about the vault contract in the{" "}
          <a
            className="text-primary underline"
            href="https://docs.ston.fi/docs/developer-section/api-reference-v2/vault"
            target="_blank noopener noreferrer"
          >
            documentation
          </a>
        </p>
      </section>

      <WalletGuard fallback={<VaultPageContentWithoutWallet />}>
        <VaultPageContentWithWallet />
      </WalletGuard>
    </section>
  );
}

function VaultPageContentWithWallet() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [poolAddress, _setPoolAddress] = useState(
    searchParams.get("pool") ?? "",
  );

  const setPoolAddress = useCallback(
    (address: typeof poolAddress) => {
      _setPoolAddress(address);

      const params = new URLSearchParams(searchParams.toString());

      if (address) {
        params.set("pool", address);
      } else {
        params.delete("pool");
      }

      router.replace(pathname + "?" + params.toString());
    },
    [router, pathname, searchParams],
  );

  return (
    <>
      <PoolAddressForm address={poolAddress} onAddressChange={setPoolAddress} />
      {poolAddress ? <PoolVaultsInfo poolAddress={poolAddress} /> : null}
    </>
  );
}

function VaultPageContentWithoutWallet() {
  return (
    <Card className="w-full h-[290px] flex items-center justify-center">
      Please connect your wallet first
    </Card>
  );
}
