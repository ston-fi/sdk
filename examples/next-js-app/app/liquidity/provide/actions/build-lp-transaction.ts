"use server";

import type { LiquidityProvisionSimulation } from "@ston-fi/api";
import { dexFactory } from "@ston-fi/sdk";
import type { SendTransactionRequest } from "@tonconnect/ui-react";

import { TON_ADDRESS } from "@/constants";
import { tonApiClient } from "@/lib/ton-api-client";

const getLpTxParams = async (
  simulation: Pick<
    LiquidityProvisionSimulation,
    | "tokenA"
    | "tokenAUnits"
    | "tokenB"
    | "tokenBUnits"
    | "minLpUnits"
    | "provisionType"
    | "router"
  >,
  walletAddress: string,
) => {
  const sharedTxArgs = {
    userWalletAddress: walletAddress,
    minLpOut: simulation.minLpUnits,
  };

  const txsArgs = [
    {
      ...sharedTxArgs,
      sendTokenAddress: simulation.tokenA,
      sendAmount: simulation.tokenAUnits,
      otherTokenAddress: simulation.tokenB,
    },
    {
      ...sharedTxArgs,
      sendTokenAddress: simulation.tokenB,
      sendAmount: simulation.tokenBUnits,
      otherTokenAddress: simulation.tokenA,
    },
  ].filter(({ sendAmount }) => BigInt(sendAmount) > 0n);

  switch (simulation.provisionType) {
    case "Balanced": {
      if (txsArgs.length !== 2) {
        throw new Error(
          `Unexpected messages length for "${simulation.provisionType}" liquidity provision. Expected: 2, Received: ${txsArgs.length}`,
        );
      }

      break;
    }
    case "Arbitrary": {
      if (txsArgs.length < 1 || txsArgs.length > 2) {
        throw new Error(
          `Unexpected messages length for "${simulation.provisionType}" liquidity provision. Expected: 1 or 2, Received: ${txsArgs.length}`,
        );
      }

      break;
    }
    default: {
      throw new Error(`Unhandled provision type: ${simulation.provisionType}`);
    }
  }

  const dexContracts = dexFactory(simulation.router);

  const routerContract = tonApiClient.open(
    dexContracts.Router.create(simulation.router.address),
  );
  const proxyTon = dexContracts.pTON.create(
    simulation.router.ptonMasterAddress,
  );

  const isSingleSide =
    simulation.provisionType === "Arbitrary" && txsArgs.length === 1;

  const getProvideLiquidityTxParams = (txArgs: (typeof txsArgs)[number]) => {
    if (txArgs.sendTokenAddress === txArgs.otherTokenAddress) {
      throw new Error(
        `Unable to provide liquidity with the same token: ${txArgs.sendTokenAddress}`,
      );
    }

    if (txArgs.sendTokenAddress === TON_ADDRESS) {
      const tonTxArgs = {
        ...txArgs,
        proxyTon,
      };

      if (isSingleSide) {
        if (
          "getSingleSideProvideLiquidityTonTxParams" in routerContract ===
          false
        ) {
          throw new Error(
            `Router ${simulation.router.address} v${simulation.router.majorVersion}.${simulation.router.minorVersion} not supported TON single side liquidity provision`,
          );
        }

        return routerContract.getSingleSideProvideLiquidityTonTxParams(
          tonTxArgs,
        );
      }

      return routerContract.getProvideLiquidityTonTxParams(tonTxArgs);
    }

    const jettonTxArgs = {
      ...txArgs,
      otherTokenAddress:
        txArgs.otherTokenAddress === TON_ADDRESS
          ? proxyTon.address.toString()
          : txArgs.otherTokenAddress,
    };

    if (isSingleSide) {
      if (
        "getSingleSideProvideLiquidityJettonTxParams" in routerContract ===
        false
      ) {
        throw new Error(
          `Router ${simulation.router.address} v${simulation.router.majorVersion}.${simulation.router.minorVersion} not supported Jetton single side liquidity provision`,
        );
      }

      return routerContract.getSingleSideProvideLiquidityJettonTxParams(
        jettonTxArgs,
      );
    }

    return routerContract.getProvideLiquidityJettonTxParams(jettonTxArgs);
  };

  /**
   * For Balances or two-sided Arbitrary provisions, we need to build two transactions.
   * During the txParams generation, we are calling the TON API.
   * * TON API by default rate limits requests to 1 per second.
   * * To avoid hitting the rate limit, you need to specify apiKey for ton-api-client with high rate limit.
   */
  const txParams = Promise.all(txsArgs.map(getProvideLiquidityTxParams));

  return txParams;
};

export const buildLpTransaction = async (
  simulation: LiquidityProvisionSimulation,
  walletAddress: string,
) => {
  const txParams = await getLpTxParams(simulation, walletAddress);

  const messages: SendTransactionRequest["messages"] = txParams.map(
    (params) => ({
      address: params.to.toString(),
      amount: params.value.toString(),
      payload: params.body?.toBoc().toString("base64"),
    }),
  );

  return messages;
};
