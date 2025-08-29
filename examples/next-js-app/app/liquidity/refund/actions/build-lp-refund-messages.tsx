"use server";

import { dexFactory } from "@ston-fi/sdk";
import type { SendTransactionRequest } from "@tonconnect/ui-react";

import { getRouter } from "@/lib/routers-repository";
import { tonApiClient } from "@/lib/ton-api-client";

export const buildLpRefundMessages = async ({
  routerAddress,
  lpAccountAddress,
}: {
  routerAddress: string;
  lpAccountAddress: string;
}) => {
  const routerInfo = await getRouter(routerAddress);

  if (!routerInfo) {
    throw new Error(`Router "${routerAddress}" not found`);
  }

  const { LpAccount } = dexFactory(routerInfo);

  const lpAccount = tonApiClient.open(LpAccount.create(lpAccountAddress));

  const txParams = await lpAccount.getRefundTxParams();

  const messages: SendTransactionRequest["messages"] = [
    {
      address: txParams.to.toString(),
      amount: txParams.value.toString(),
      payload: txParams.body?.toBoc().toString("base64"),
    },
  ];

  return messages;
};
