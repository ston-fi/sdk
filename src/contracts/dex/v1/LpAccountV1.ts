import TonWeb, { type ContractOptions } from "tonweb";

import type {
  BN,
  Cell,
  MessageData,
  QueryIdType,
  AmountType,
  SdkContractOptions,
} from "@/types";
import { StonApiClient } from "@/StonApiClient";
import { parseAddressNotNull } from "@/utils/parseAddress";

import { DEX_VERSION, DEX_OP_CODES } from "../constants";

const {
  utils: { BN },
  boc: { Cell },
  Contract,
  Address,
} = TonWeb;

export interface LpAccountV1Options
  extends SdkContractOptions,
    ContractOptions {
  address: Required<ContractOptions>["address"];
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
    refund: new BN("300000000"),
    directAddLp: new BN("300000000"),
    resetGas: new BN("300000000"),
  };

  protected readonly stonApiClient;

  public readonly gasConstants;

  constructor({
    tonApiClient,
    stonApiClient,
    gasConstants,
    ...options
  }: LpAccountV1Options) {
    super(tonApiClient, options);

    this.stonApiClient = stonApiClient ?? new StonApiClient(tonApiClient);
    this.gasConstants = {
      ...LpAccountV1.gasConstants,
      ...gasConstants,
    };
  }

  public async createRefundBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    const message = new Cell();

    message.bits.writeUint(DEX_OP_CODES.REFUND, 32);
    message.bits.writeUint(params?.queryId ?? 0, 64);

    return message;
  }

  /**
   * Build all data required to execute a `refund_me` transaction.
   *
   * @param {BN | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} all data required to execute a `refund_me` transaction.
   */
  public async buildRefundTxParams(params?: {
    gasAmount?: AmountType;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const to = await this.getAddress();

    const payload = await this.createRefundBody({ queryId: params?.queryId });

    const gasAmount = new BN(params?.gasAmount ?? this.gasConstants.refund);

    return {
      to: new Address(to.toString(true, true, true)),
      payload,
      gasAmount,
    };
  }

  public async createDirectAddLiquidityBody(params: {
    amount0: AmountType;
    amount1: AmountType;
    minimumLpToMint?: AmountType;
    queryId?: QueryIdType;
  }): Promise<Cell> {
    const message = new Cell();

    message.bits.writeUint(DEX_OP_CODES.DIRECT_ADD_LIQUIDITY, 32);
    message.bits.writeUint(params.queryId ?? 0, 64);
    message.bits.writeCoins(new BN(params.amount0));
    message.bits.writeCoins(new BN(params.amount1));
    message.bits.writeCoins(new BN(params.minimumLpToMint ?? 1));

    return message;
  }

  /**
   * Build all data required to execute a `direct_add_liquidity` transaction.
   *
   * @param {BN | number} params.amount0 - Amount of the first Jetton tokens (in basic token units)
   * @param {BN | number} params.amount1 - Amount of the second Jetton tokens (in basic token units)
   * @param {BN | number | undefined} params.minimumLpToMint - Optional; minimum amount of received liquidity tokens (in basic token units)
   * @param {BN | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} all data required to execute a `direct_add_liquidity` transaction.
   */
  public async buildDirectAddLiquidityTxParams(params: {
    amount0: AmountType;
    amount1: AmountType;
    minimumLpToMint?: AmountType;
    gasAmount?: AmountType;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const to = await this.getAddress();

    const payload = await this.createDirectAddLiquidityBody({
      amount0: params.amount0,
      amount1: params.amount1,
      minimumLpToMint: params.minimumLpToMint,
      queryId: params.queryId,
    });

    const gasAmount = new BN(params.gasAmount ?? this.gasConstants.directAddLp);

    return {
      to: new Address(to.toString(true, true, true)),
      payload,
      gasAmount,
    };
  }

  public async createResetGasBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    const message = new Cell();

    message.bits.writeUint(DEX_OP_CODES.RESET_GAS, 32);
    message.bits.writeUint(params?.queryId ?? 0, 64);

    return message;
  }

  /**
   * Build all data required to execute a `reset_gas` transaction.
   *
   * @param {BN | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} all data required to execute a `reset_gas` transaction.
   */
  public async buildResetGasTxParams(params?: {
    gasAmount?: AmountType;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const to = await this.getAddress();

    const payload = await this.createResetGasBody({ queryId: params?.queryId });

    const gasAmount = new BN(params?.gasAmount ?? this.gasConstants.resetGas);

    return {
      to: new Address(to.toString(true, true, true)),
      payload,
      gasAmount,
    };
  }

  /**
   * @returns structure containing current state of the lp account.
   */
  public async getData() {
    const contractAddress = await this.getAddress();

    const result = await this.provider.call2(
      contractAddress.toString(),
      "get_lp_account_data",
    );

    return {
      userAddress: parseAddressNotNull(result[0] as Cell),
      poolAddress: parseAddressNotNull(result[1] as Cell),
      amount0: result[2] as BN,
      amount1: result[3] as BN,
    };
  }
}
