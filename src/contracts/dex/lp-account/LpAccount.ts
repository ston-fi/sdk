import TonWeb from 'tonweb';

import { ROUTER_REVISION } from '../constants';
import type {
  Address,
  Cell,
  HttpProvider,
  BN,
  AddressType,
  QueryIdType,
  ContractOptions,
  MessageData,
  AmountType,
} from '@/types';

import type {
  LpAccountRevision,
  LpAccountGasConstants,
} from './LpAccountRevision';
import { LpAccountRevisionV1 } from './LpAccountRevisionV1';

const {
  Contract,
  utils: { BN },
} = TonWeb;

const REVISIONS = {
  [ROUTER_REVISION.V1]: LpAccountRevisionV1,
} as const;

/**
 * @type {LpAccountData} represent state of the lp account.
 *
 * @property {Address | null} userAddress - Owner's address
 * @property {Address | null} poolAddress - Pool's address
 * @property {BN} amount0 - Balance of the first Jetton token (in basic token units)
 * @property {BN} amount1 - Balance of the second Jetton token (in basic token units)
 */
export type LpAccountData = {
  userAddress: Address | null;
  poolAddress: Address | null;
  amount0: BN;
  amount1: BN;
};

interface LpAccountOptions extends ContractOptions {
  revision: LpAccountRevision | keyof typeof REVISIONS;
  address: AddressType;
}

/**
 * @type {LpAccount} represents the lp account contract and provide methods to interact with it.
 *
 * The lp account contract holds information about the liquidity provided by the user before minting new liquidity.
 * It interacts only with a single pool contract. For each user, there is single account contract for each pool.
 * The router “routes” the temporary liquidity to the correct account contract.
 * Then the account contract calls the pool contract again to mint new liquidity (once it satisfies some requirements).
 */
export class LpAccount extends Contract {
  private revision: LpAccountRevision;

  constructor(
    provider: HttpProvider,
    { revision, ...options }: LpAccountOptions,
  ) {
    super(provider, options);

    if (typeof revision === 'string') {
      if (!REVISIONS[revision])
        throw Error(`Unknown account revision: ${revision}`);

      this.revision = new REVISIONS[revision]();
    } else {
      this.revision = revision;
    }
  }

  public get gasConstants(): LpAccountGasConstants {
    return this.revision.gasConstants;
  }

  /**
   * Create a payload for the `refund_me` transaction.
   *
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {Cell} payload for the `refund_me` transaction.
   */
  public async createRefundBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return this.revision.createRefundBody(this, params);
  }

  /**
   * Create a payload for the `direct_add_liquidity` transaction.
   *
   * @param {BN | number} params.amount0 - Amount of the first Jetton tokens (in basic token units)
   * @param {BN | number} params.amount1 - Amount of the second Jetton tokens (in basic token units)
   * @param {BN | number | undefined} params.minimumLpToMint - Optional; minimum amount of received liquidity tokens (in basic token units)
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {Cell} payload for the `direct_add_liquidity` transaction.
   */
  public async createDirectAddLiquidityBody(params: {
    amount0: AmountType;
    amount1: AmountType;
    minimumLpToMint?: AmountType;
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return this.revision.createDirectAddLiquidityBody(this, params);
  }

  /**
   * Create a payload for the `reset_gas` transaction.
   *
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {Cell} payload for the `reset_gas` transaction.
   */
  public async createResetGasBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return this.revision.createResetGasBody(this, params);
  }

  /**
   * @returns {LpAccountData} structure containing current state of the lp account.
   */
  public async getData(): Promise<LpAccountData> {
    return await this.revision.getData(this);
  }

  /**
   * Build all data required to execute a `refund_me` transaction.
   *
   * @param {BN | number | undefined} params.gasAmount - Optional; amount of gas for the transaction (in nanoTons)
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

    return { to, payload, gasAmount };
  }

  /**
   * Build all data required to execute a `direct_add_liquidity` transaction.
   *
   * @param {BN | number} params.amount0 - Amount of the first Jetton tokens (in basic token units)
   * @param {BN | number} params.amount1 - Amount of the second Jetton tokens (in basic token units)
   * @param {BN | number | undefined} params.minimumLpToMint - Optional; minimum amount of received liquidity tokens (in basic token units)
   * @param {BN | number | undefined} params.gasAmount - Optional; amount of gas for the transaction (in nanoTons)
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

    return { to, payload, gasAmount };
  }

  /**
   * Build all data required to execute a `reset_gas` transaction.
   *
   * @param {BN | number | undefined} params.gasAmount - Optional; amount of gas for the transaction (in nanoTons)
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

    return { to, payload, gasAmount };
  }
}
