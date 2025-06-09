"use server";

import type { SwapSimulation } from "@ston-fi/api";
import {
  type AddressType,
  type AmountType,
  type QueryIdType,
  dexFactory,
} from "@ston-fi/sdk";
import type { SendTransactionRequest } from "@tonconnect/ui-react";

import { getRouter } from "@/lib/routers-repository";
import { tonApiClient } from "@/lib/ton-api-client";

import { TON_ADDRESS } from "@/constants";

const getSwapTxParams = async (
  simulation: SwapSimulation,
  walletAddress: string,
  params?: {
    queryId?: QueryIdType;
    referralAddress?: AddressType;
    referralValue?: AmountType;
  },
) => {
  const routerMetadata = await getRouter(simulation.routerAddress);

  if (!routerMetadata) {
    throw new Error(`Router ${simulation.routerAddress} not found`);
  }

  const dexContracts = dexFactory(routerMetadata);

  const router = tonApiClient.open(
    dexContracts.Router.create(routerMetadata.address),
  );

  const sharedTxParams = {
    ...params,
    userWalletAddress: walletAddress,
    offerAmount: simulation.offerUnits,
    minAskAmount: simulation.minAskUnits,
  };

  if (
    simulation.askAddress !== TON_ADDRESS &&
    simulation.offerAddress !== TON_ADDRESS
  ) {
    return router.getSwapJettonToJettonTxParams({
      ...sharedTxParams,
      offerJettonAddress: simulation.offerAddress,
      askJettonAddress: simulation.askAddress,
    });
  }

  const proxyTon = dexContracts.pTON.create(routerMetadata.ptonMasterAddress);

  if (simulation.offerAddress === TON_ADDRESS) {
    return router.getSwapTonToJettonTxParams({
      ...sharedTxParams,
      proxyTon,
      askJettonAddress: simulation.askAddress,
    });
  }

  return router.getSwapJettonToTonTxParams({
    ...sharedTxParams,
    proxyTon,
    offerJettonAddress: simulation.offerAddress,
  });
};

export const buildSwapTransaction = async (
  simulation: SwapSimulation,
  walletAddress: string,
  params?: {
    queryId?: QueryIdType;
    referralAddress?: AddressType;
    referralValue?: AmountType;
  },
) => {
  const txParams = await getSwapTxParams(simulation, walletAddress, params);

  const messages: SendTransactionRequest["messages"] = [
    {
      address: txParams.to.toString(),
      amount: txParams.value.toString(),
      payload: txParams.body?.toBoc().toString("base64"),
    },
  ];

  return messages;
};
