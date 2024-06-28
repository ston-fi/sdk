import {
  type Cell,
  type ContractProvider,
  type Sender,
  type SenderArguments,
  beginCell,
  toNano,
} from "@ton/ton";

import { Contract, type ContractOptions } from "@/contracts/core/Contract";
import type { AddressType, AmountType, QueryIdType } from "@/types";

import { DEX_OP_CODES, DEX_VERSION } from "../constants";

export interface LpAccountV1Options extends ContractOptions {
  gasConstants?: Partial<typeof LpAccountV1.gasConstants>;
}

/**
 * The lp account contract holds information about the liquidity provided by the user before minting new liquidity.
 * It interacts only with a single pool contract. For each user, there is single account contract for each pool.
 * The router “routes” the temporary liquidity to the correct account contract.
 * Then the account contract calls the pool contract again to mint new liquidity (once it satisfies some requirements).
 */
export class LpAccountV1 extends Contract {
  public static readonly version = DEX_VERSION.v1;

  public static readonly gasConstants = {
    refund: toNano("0.3"),
    directAddLp: toNano("0.3"),
    resetGas: toNano("0.3"),
  };

  public readonly gasConstants;

  constructor(
    address: AddressType,
    { gasConstants, ...options }: LpAccountV1Options = {},
  ) {
    super(address, options);

    this.gasConstants = {
      ...LpAccountV1.gasConstants,
      ...gasConstants,
    };
  }

  public async createRefundBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(DEX_OP_CODES.REFUND_ME, 32)
      .storeUint(params?.queryId ?? 0, 64)
      .endCell();
  }

  /**
   * Build all data required to execute a `refund_me` transaction.
   *
   * @param {bigint | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   *
   * @returns {SenderArguments} all data required to execute a `refund_me` transaction.
   */
  public async getRefundTxParams(
    provider: ContractProvider,
    params?: {
      gasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = this.address;

    const body = await this.createRefundBody({
      queryId: params?.queryId,
    });

    const value = BigInt(params?.gasAmount ?? this.gasConstants.refund);

    return { to, value, body };
  }

  public async sendRefund(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<LpAccountV1["getRefundTxParams"]>[1],
  ) {
    const txParams = await this.getRefundTxParams(provider, params);

    return via.send(txParams);
  }

  public async createDirectAddLiquidityBody(params: {
    amount0: AmountType;
    amount1: AmountType;
    minimumLpToMint?: AmountType;
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(DEX_OP_CODES.DIRECT_ADD_LIQUIDITY, 32)
      .storeUint(params?.queryId ?? 0, 64)
      .storeCoins(BigInt(params.amount0))
      .storeCoins(BigInt(params.amount1))
      .storeCoins(BigInt(params.minimumLpToMint ?? 1))
      .endCell();
  }

  /**
   * Build all data required to execute a `direct_add_liquidity` transaction.
   *
   * @param {bigint | number} params.amount0 - Amount of the first Jetton tokens (in basic token units)
   * @param {bigint | number} params.amount1 - Amount of the second Jetton tokens (in basic token units)
   * @param {bigint | number | undefined} params.minimumLpToMint - Optional; minimum amount of received liquidity tokens (in basic token units)
   * @param {bigint | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   *
   * @returns {SenderArguments} all data required to execute a `direct_add_liquidity` transaction.
   */
  public async getDirectAddLiquidityTxParams(
    provider: ContractProvider,
    params: {
      amount0: AmountType;
      amount1: AmountType;
      minimumLpToMint?: AmountType;
      gasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = this.address;

    const body = await this.createDirectAddLiquidityBody({
      amount0: params.amount0,
      amount1: params.amount1,
      minimumLpToMint: params.minimumLpToMint,
      queryId: params.queryId,
    });

    const value = BigInt(params.gasAmount ?? this.gasConstants.directAddLp);

    return { to, value, body };
  }

  public async sendDirectAddLiquidity(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<LpAccountV1["getDirectAddLiquidityTxParams"]>[1],
  ) {
    const txParams = await this.getDirectAddLiquidityTxParams(provider, params);

    return via.send(txParams);
  }

  public async createResetGasBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(DEX_OP_CODES.RESET_GAS, 32)
      .storeUint(params?.queryId ?? 0, 64)
      .endCell();
  }

  /**
   * Build all data required to execute a `reset_gas` transaction.
   *
   * @param {bigint | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   *
   * @returns {SenderArguments} all data required to execute a `reset_gas` transaction.
   */
  public async getResetGasTxParams(
    provider: ContractProvider,
    params?: {
      gasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = this.address;

    const body = await this.createResetGasBody({
      queryId: params?.queryId,
    });

    const value = BigInt(params?.gasAmount ?? this.gasConstants.resetGas);

    return { to, value, body };
  }

  public async sendResetGas(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<LpAccountV1["getResetGasTxParams"]>[1],
  ) {
    const txParams = await this.getResetGasTxParams(provider, params);

    return via.send(txParams);
  }

  /**
   * @returns structure containing current state of the lp account.
   */
  public async getLpAccountData(provider: ContractProvider) {
    const result = await provider.get("get_lp_account_data", []);

    return {
      userAddress: result.stack.readAddress(),
      poolAddress: result.stack.readAddress(),
      amount0: result.stack.readBigNumber(),
      amount1: result.stack.readBigNumber(),
    };
  }
}
