"use client";

import { Card } from "@/components/ui/card";
import { WalletGuard } from "@/components/wallet-guard";

import { VaultClaimParamsForm } from "./components/vault-claim-params-form";
import { PoolVaultsInfo } from "./components/vault-info";
import { VaultClaimParamsProvider } from "./providers";

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
  return (
    <VaultClaimParamsProvider>
      <VaultClaimParamsForm />
      <PoolVaultsInfo />
    </VaultClaimParamsProvider>
  );
}

function VaultPageContentWithoutWallet() {
  return (
    <Card className="w-full h-[290px] flex items-center justify-center">
      Please connect your wallet first
    </Card>
  );
}
