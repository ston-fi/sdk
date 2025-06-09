"use server";

import { DEX_VERSION, routerFactory } from "@ston-fi/sdk";
import type { SendTransactionRequest } from "@tonconnect/ui-react";

import { TON_ADDRESS } from "@/constants";
import { getRouter } from "@/lib/routers-repository";
import { tonApiClient } from "@/lib/ton-api-client";

type GetVaultParams = {
  userWalletAddress: string;
  routerAddress: string;
  tokenMinter: string;
};

const getVault = async ({
  userWalletAddress,
  routerAddress,
  tokenMinter,
}: GetVaultParams) => {
  const routerInfo = await getRouter(routerAddress);

  if (!routerInfo) {
    throw new Error("Unknown router");
  }

  const router = tonApiClient.open(routerFactory(routerInfo));

  if (!("getVault" in router)) {
    throw new Error(`Vault contract does not exist in DEX ${DEX_VERSION.v1}`);
  }

  return router.getVault({
    tokenMinter:
      tokenMinter === TON_ADDRESS ? routerInfo.ptonMasterAddress : tokenMinter,
    user: userWalletAddress,
  });
};

export async function buildVaultWithdrawalFeeTx(
  params: GetVaultParams[],
): Promise<SendTransactionRequest["messages"]> {
  const vaults = (await Promise.all(params.map(getVault))).map((vault) =>
    tonApiClient.open(vault),
  );

  const txParams = await Promise.all(
    vaults.map((vault) => vault.getWithdrawFeeTxParams()),
  );

  return txParams.map(({ to, value, body }) => ({
    address: to.toString(),
    amount: value.toString(),
    payload: body?.toBoc().toString("base64"),
  }));
}
