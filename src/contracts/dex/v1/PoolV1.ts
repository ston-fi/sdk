import TonWeb, { type ContractOptions } from "tonweb";

import type {
  BN,
  Cell,
  MessageData,
  AddressType,
  QueryIdType,
  AmountType,
  SdkContractOptions,
} from "@/types";
import { StonApiClient } from "@/StonApiClient";
import { parseAddress, parseAddressNotNull } from "@/utils/parseAddress";

import { DEX_VERSION, DEX_OP_CODES } from "../constants";
import { LpAccountV1 } from "./LpAccountV1";

const {
  utils: { BN, bytesToBase64 },
  boc: { Cell },
  Address,
  token: {
    jetton: { JettonMinter, JettonWallet },
  },
} = TonWeb;

export interface PoolV1Options extends SdkContractOptions, ContractOptions {
  address: Required<ContractOptions>["address"];
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
    collectFees: new BN("1100000000"),
    burn: new BN("500000000"),
  };

  protected readonly stonApiClient;

  public readonly gasConstants;

  constructor({
    tonApiClient,
    stonApiClient,
    gasConstants,
    ...options
  }: PoolV1Options) {
    super(
      tonApiClient,
      // @ts-expect-error - not all parameters are really required here
      options,
    );

    this.stonApiClient = stonApiClient ?? new StonApiClient(tonApiClient);
    this.gasConstants = {
      ...PoolV1.gasConstants,
      ...gasConstants,
    };
  }

  protected async createCollectFeesBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    const message = new Cell();

    message.bits.writeUint(DEX_OP_CODES.COLLECT_FEES, 32);
    message.bits.writeUint(params?.queryId ?? 0, 64);

    return message;
  }

  /**
   * Build all data required to execute a `collect_fees` transaction.
   *
   * @param {BN | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} all data required to execute a `collect_fees` transaction.
   */
  public async buildCollectFeeTxParams(params?: {
    gasAmount?: AmountType;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const to = await this.getAddress();

    const payload = await this.createCollectFeesBody({
      queryId: params?.queryId,
    });

    const gasAmount = new BN(
      params?.gasAmount ?? this.gasConstants.collectFees,
    );

    return {
      to: new Address(to.toString(true, true, true)),
      payload,
      gasAmount,
    };
  }

  protected async createBurnBody(params: {
    amount: AmountType;
    responseAddress: AddressType;
    queryId?: QueryIdType;
  }): Promise<Cell> {
    const message = new Cell();

    message.bits.writeUint(DEX_OP_CODES.REQUEST_BURN, 32);
    message.bits.writeUint(params.queryId ?? 0, 64);
    message.bits.writeCoins(new BN(params.amount));
    message.bits.writeAddress(new Address(params.responseAddress));

    return message;
  }

  /**
   * Build all data required to execute a `burn` transaction.
   *
   * @param {BN | number} params.amount - Amount of lp tokens to burn (in basic token units)
   * @param {Address | string} params.responseAddress - Address of a user
   * @param {BN | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} all data required to execute a `burn` transaction.
   */
  public async buildBurnTxParams(params: {
    amount: AmountType;
    responseAddress: AddressType;
    gasAmount?: AmountType;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const contractAddress = await this.getAddress();

    const [to, payload] = await Promise.all([
      (async () =>
        new Address(
          await this.stonApiClient.getJettonWalletAddress({
            jettonAddress: contractAddress.toString(),
            ownerAddress: params.responseAddress.toString(),
          }),
        ))(),
      this.createBurnBody({
        amount: params.amount,
        responseAddress: params.responseAddress,
        queryId: params.queryId,
      }),
    ]);

    const gasAmount = new BN(params.gasAmount ?? this.gasConstants.burn);

    return {
      to: new Address(to.toString(true, true, true)),
      payload,
      gasAmount,
    };
  }

  /**
   * Estimate expected result of the amount of jettonWallet tokens swapped to the other type of tokens of the pool
   *
   * @param {BN | number} params.amount - Amount of tokens to swap (in basic token units)
   * @param {Address | string} params.jettonWallet - Token Jetton address (must be equal to one of the Jetton addresses of the pool)
   *
   * @returns {ExpectedOutputsData} structure with expected result of a token swap
   */
  public async getExpectedOutputs(params: {
    amount: AmountType;
    jettonWallet: AddressType;
  }) {
    const cell = new Cell();

    cell.bits.writeAddress(new Address(params.jettonWallet));

    const slice = bytesToBase64(await cell.toBoc(false));

    const poolAddress = await this.getAddress();

    const result = await this.provider.call2(
      poolAddress.toString(),
      "get_expected_outputs",
      [
        ["int", params.amount.toString()],
        ["tvm.Slice", slice],
      ],
    );

    return {
      jettonToReceive: result[0] as BN,
      protocolFeePaid: result[1] as BN,
      refFeePaid: result[2] as BN,
    };
  }

  /**
   * Estimate an expected amount of lp tokens minted when providing liquidity.
   *
   * @param {BN | number} params.amount0 - Amount of tokens for the first Jetton (in basic token units)
   * @param {BN | number} params.amount1 - Amount of tokens for the second Jetton (in basic token units)
   *
   * @returns {BN} an estimated amount of liquidity tokens to be minted
   */
  public async getExpectedTokens(params: {
    amount0: AmountType;
    amount1: AmountType;
  }) {
    const poolAddress = await this.getAddress();

    const result = await this.provider.call2(
      poolAddress.toString(),
      "get_expected_tokens",
      [
        ["int", params.amount0.toString()],
        ["int", params.amount1.toString()],
      ],
    );

    return result as BN;
  }

  /**
   * Estimate expected liquidity freed upon burning liquidity tokens.
   *
   * @param {BN | number} params.jettonAmount - Amount of liquidity tokens (in basic token units)
   *
   * @returns {PoolAmountsData} structure with expected freed liquidity
   */
  public async getExpectedLiquidity(params: {
    jettonAmount: AmountType;
  }) {
    const poolAddress = await this.getAddress();

    const result = await this.provider.call2(
      poolAddress.toString(),
      "get_expected_liquidity",
      [["int", params.jettonAmount.toString()]],
    );

    return {
      amount0: result[0] as BN,
      amount1: result[1] as BN,
    };
  }

  /**
   * @param {Address | string} params.ownerAddress - Address of a user
   *
   * @returns the lp account address of a user
   */
  public async getLpAccountAddress(params: {
    ownerAddress: AddressType;
  }) {
    const cell = new Cell();

    cell.bits.writeAddress(new Address(params.ownerAddress));

    const slice = bytesToBase64(await cell.toBoc(false));

    const poolAddress = await this.getAddress();

    const result = await this.provider.call2(
      poolAddress.toString(),
      "get_lp_account_address",
      [["tvm.Slice", slice]],
    );

    return parseAddress(result);
  }

  /**
   * @param {Address | string} params.ownerAddress - Address of a user
   *
   * @returns a JettonWallet object for an address returned by getJettonWalletAddress
   */
  public async getJettonWallet(params: { ownerAddress: AddressType }) {
    const poolWalletAddress = await this.getJettonWalletAddress(
      new Address(params.ownerAddress),
    );

    return new JettonWallet(this.provider, { address: poolWalletAddress });
  }

  /**
   * @returns structure containing current state of the pool.
   */
  public async getData() {
    const contractAddress = await this.getAddress();

    const result = await this.provider.call2(
      contractAddress.toString(),
      "get_pool_data",
    );

    return {
      reserve0: result[0] as BN,
      reserve1: result[1] as BN,
      token0WalletAddress: parseAddressNotNull(result[2] as Cell),
      token1WalletAddress: parseAddressNotNull(result[3] as Cell),
      lpFee: result[4] as BN,
      protocolFee: result[5] as BN,
      refFee: result[6] as BN,
      protocolFeeAddress: parseAddress(result[7]),
      collectedToken0ProtocolFee: result[8] as BN,
      collectedToken1ProtocolFee: result[9] as BN,
    };
  }

  /**
   * @param {Address | string} params.ownerAddress - Address of a user
   *
   * @returns {LpAccount} object for address returned by getLpAccountAddress
   */
  public async getLpAccount(params: {
    ownerAddress: AddressType;
  }) {
    const accountAddress = await this.getLpAccountAddress(params);

    if (!accountAddress) return null;

    return new LpAccountV1({
      tonApiClient: this.provider,
      stonApiClient: this.stonApiClient,
      address: accountAddress,
    });
  }
}
