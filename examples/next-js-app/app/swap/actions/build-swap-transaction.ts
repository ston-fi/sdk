"use server";

import type { SwapSimulation } from "@ston-fi/api";
import { type QueryIdType, dexFactory } from "@ston-fi/sdk";
import type { SendTransactionRequest } from "@tonconnect/ui-react";

import { stonApiClient } from "@/lib/ston-api-client";
import { tonApiClient } from "@/lib/ton-api-client";

import { TON_ADDRESS } from "@/constants";

const getSwapTxParams = async (
  simulation: SwapSimulation,
  walletAddress: string,
  params?: { queryId?: QueryIdType },
) => {
  const routerMetadata = await stonApiClient.getRouter(
    simulation.routerAddress,
  );

  const dexContracts = dexFactory(routerMetadata);

  const router = tonApiClient.open(
    dexContracts.Router.create(routerMetadata.address),
  );

  if (
    simulation.askAddress !== TON_ADDRESS &&
    simulation.offerAddress !== TON_ADDRESS
  ) {
    return router.getSwapJettonToJettonTxParams({
      userWalletAddress: walletAddress,
      offerJettonAddress: simulation.offerAddress,
      offerAmount: simulation.offerUnits,
      askJettonAddress: simulation.askAddress,
      minAskAmount: simulation.minAskUnits,
      ...params,
    });
  }

  const proxyTon = dexContracts.pTON.create(routerMetadata.ptonMasterAddress);

  if (simulation.offerAddress === TON_ADDRESS) {
    return router.getSwapTonToJettonTxParams({
      userWalletAddress: walletAddress,
      proxyTon,
      offerAmount: simulation.offerUnits,
      askJettonAddress: simulation.askAddress,
      minAskAmount: simulation.minAskUnits,
      ...params,
    });
  }

  return router.getSwapJettonToTonTxParams({
    userWalletAddress: walletAddress,
    proxyTon,
    offerAmount: simulation.offerUnits,
    offerJettonAddress: simulation.offerAddress,
    minAskAmount: simulation.minAskUnits,
    ...params,
  });
};

export const buildSwapTransaction = async (
  simulation: SwapSimulation,
  walletAddress: string,
  params?: { queryId?: QueryIdType },
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
