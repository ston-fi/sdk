import {
  type Cell,
  type ContractProvider,
  type Sender,
  type SenderArguments,
  beginCell,
  toNano,
} from "@ton/ton";

import type { ContractOptions } from "@/contracts/core/Contract";
import { JettonMinter } from "@/contracts/core/JettonMinter";
import { JettonWallet } from "@/contracts/core/JettonWallet";
import type { AddressType, AmountType, QueryIdType } from "@/types";
import { toAddress } from "@/utils/toAddress";

import { DEX_VERSION } from "../constants";

import { DEX_OP_CODES } from "./constants";
import { LpAccountV1 } from "./LpAccountV1";

export interface PoolV1Options extends ContractOptions {
  gasConstants?: Partial<typeof PoolV1.gasConstants>;
}

/**
 * The pool is the contract that stores the AMM data for a certain pair and is responsible for handling “swaps” or providing liquidity for a certain pool.
 * For each pair (e.g. STON/USDT), there is only a single pool contract.
 * The pool is also a Jetton Minter, and handles minting/burning of Liquidity Provider Jettons.
 * All the swap/lp calculations are done in the pool contract.
 */
export class PoolV1 extends JettonMinter {
  public static readonly version = DEX_VERSION.v1;
  public static readonly gasConstants = {
    collectFees: toNano("1.1"),
    burn: toNano("0.5"),
  };

  public readonly gasConstants;

  constructor(
    address: AddressType,
    { gasConstants, ...options }: PoolV1Options = {},
  ) {
    super(address, options);

    this.gasConstants = {
      ...PoolV1.gasConstants,
      ...gasConstants,
    };
  }

  public async createCollectFeesBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(DEX_OP_CODES.COLLECT_FEES, 32)
      .storeUint(params?.queryId ?? 0, 64)
      .endCell();
  }

  /**
   * Build all data required to execute a `collect_fees` transaction.
   *
   * @param {bigint | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   *
   * @returns {SenderArguments} all data required to execute a `collect_fees` transaction.
   */
  public async getCollectFeeTxParams(
    provider: ContractProvider,
    params?: {
      gasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = this.address;

    const body = await this.createCollectFeesBody({
      queryId: params?.queryId,
    });

    const value = BigInt(params?.gasAmount ?? this.gasConstants.collectFees);

    return { to, value, body };
  }

  public async sendCollectFees(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<PoolV1["getCollectFeeTxParams"]>[1],
  ) {
    const txParams = await this.getCollectFeeTxParams(provider, params);

    return via.send(txParams);
  }

  public async createBurnBody(params: {
    amount: AmountType;
    responseAddress: AddressType;
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(DEX_OP_CODES.BURN, 32)
      .storeUint(params?.queryId ?? 0, 64)
      .storeCoins(BigInt(params.amount))
      .storeAddress(toAddress(params.responseAddress))
      .endCell();
  }

  /**
   * Build all data required to execute a `burn` transaction.
   *
   * @param {bigint | number} params.amount - Amount of lp tokens to burn (in basic token units)
   * @param {Address | string} params.responseAddress - Address of a user
   * @param {bigint | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   *
   * @returns {SenderArguments} all data required to execute a `burn` transaction.
   */
  public async getBurnTxParams(
    provider: ContractProvider,
    params: {
      amount: AmountType;
      responseAddress: AddressType;
      gasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const [to, body] = await Promise.all([
      this.getWalletAddress(provider, params.responseAddress),
      this.createBurnBody({
        amount: params.amount,
        responseAddress: params.responseAddress,
        queryId: params.queryId,
      }),
    ]);

    const value = BigInt(params.gasAmount ?? this.gasConstants.burn);

    return { to, value, body };
  }

  public async sendBurn(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<PoolV1["getBurnTxParams"]>[1],
  ) {
    const txParams = await this.getBurnTxParams(provider, params);

    return via.send(txParams);
  }

  /**
   * Estimate the expected result of the amount of jettonWallet tokens swapped to the other token of the pool
   *
   * @param {bigint | number} params.amount - Amount of tokens to swap (in basic token units)
   * @param {Address | string} params.jettonWallet - jetton wallet address (owned by the router)
   *
   * @returns structure with the expected result of a token swap
   */
  public async getExpectedOutputs(
    provider: ContractProvider,
    params: {
      amount: AmountType;
      jettonWallet: AddressType;
    },
  ) {
    const result = await provider.get("get_expected_outputs", [
      { type: "int", value: BigInt(params.amount) },
      {
        type: "slice",
        cell: beginCell()
          .storeAddress(toAddress(params.jettonWallet))
          .endCell(),
      },
    ]);

    return {
      jettonToReceive: result.stack.readBigNumber(),
      protocolFeePaid: result.stack.readBigNumber(),
      refFeePaid: result.stack.readBigNumber(),
    };
  }

  /**
   * Estimate an expected amount of lp tokens minted when providing liquidity.
   *
   * @param {bigint | number} params.amount0 - Amount of tokens for the first Jetton (in basic token units)
   * @param {bigint | number} params.amount1 - Amount of tokens for the second Jetton (in basic token units)
   *
   * @returns {bigint} an estimated amount of liquidity tokens to be minted
   */
  public async getExpectedTokens(
    provider: ContractProvider,
    params: {
      amount0: AmountType;
      amount1: AmountType;
    },
  ) {
    const result = await provider.get("get_expected_tokens", [
      { type: "int", value: BigInt(params.amount0) },
      { type: "int", value: BigInt(params.amount1) },
    ]);

    return result.stack.readBigNumber();
  }

  /**
   * Estimate expected liquidity freed upon burning liquidity tokens.
   *
   * @param {bigint | number} params.jettonAmount - Amount of liquidity tokens (in basic token units)
   *
   * @returns structure with expected freed liquidity
   */
  public async getExpectedLiquidity(
    provider: ContractProvider,
    params: {
      jettonAmount: AmountType;
    },
  ) {
    const result = await provider.get("get_expected_liquidity", [
      { type: "int", value: BigInt(params.jettonAmount) },
    ]);

    return {
      amount0: result.stack.readBigNumber(),
      amount1: result.stack.readBigNumber(),
    };
  }

  /**
   * @param {Address | string} params.ownerAddress - Address of a user
   *
   * @returns {Address} the lp account address of a user
   */
  public async getLpAccountAddress(
    provider: ContractProvider,
    params: {
      ownerAddress: AddressType;
    },
  ) {
    const result = await provider.get("get_lp_account_address", [
      {
        type: "slice",
        cell: beginCell()
          .storeAddress(toAddress(params.ownerAddress))
          .endCell(),
      },
    ]);

    return result.stack.readAddress();
  }

  /**
   * @param {Address | string} params.ownerAddress - Address of a user
   *
   * @returns {JettonWallet} a JettonWallet instance with address returned by getJettonWalletAddress
   */
  public async getJettonWallet(
    provider: ContractProvider,
    params: {
      ownerAddress: AddressType;
    },
  ) {
    const jettonWalletAddress = await this.getWalletAddress(
      provider,
      params.ownerAddress,
    );

    return JettonWallet.create(jettonWalletAddress);
  }

  /**
   * @returns structure containing current state of the pool.
   */
  public async getPoolData(provider: ContractProvider) {
    const result = await provider.get("get_pool_data", []);

    return {
      reserve0: result.stack.readBigNumber(),
      reserve1: result.stack.readBigNumber(),
      token0WalletAddress: result.stack.readAddress(),
      token1WalletAddress: result.stack.readAddress(),
      lpFee: result.stack.readBigNumber(),
      protocolFee: result.stack.readBigNumber(),
      refFee: result.stack.readBigNumber(),
      protocolFeeAddress: result.stack.readAddress(),
      collectedToken0ProtocolFee: result.stack.readBigNumber(),
      collectedToken1ProtocolFee: result.stack.readBigNumber(),
    };
  }

  /**
   * @param {Address | string} params.ownerAddress - Address of a user
   *
   * @returns {LpAccount} object for address returned by getLpAccountAddress
   */
  public async getLpAccount(
    provider: ContractProvider,
    params: {
      ownerAddress: AddressType;
    },
  ) {
    const lpAccountAddress = await this.getLpAccountAddress(provider, params);

    return LpAccountV1.create(lpAccountAddress);
  }
}
