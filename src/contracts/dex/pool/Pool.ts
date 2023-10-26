import TonWeb from 'tonweb';

import { LpAccount } from '../lp-account/LpAccount';
import { ROUTER_REVISION } from '../constants';
import type {
  Address,
  Cell,
  HttpProvider,
  JettonMinter,
  JettonWallet,
  BN,
  AddressType,
  QueryIdType,
  JettonMinterOptions,
  MessageData,
  AmountType,
} from '@/types';

import { PoolGasConstants, PoolRevision } from './PoolRevision';
import { PoolRevisionV1 } from './PoolRevisionV1';

const {
  Address,
  utils: { BN },
  token: {
    jetton: { JettonMinter, JettonWallet },
  },
} = TonWeb;

const REVISIONS = {
  [ROUTER_REVISION.V1]: PoolRevisionV1,
} as const;

/**
 * @type {PoolData} state of the pool: Jetton token reserves, Jetton wallet addresses and fee parameters.
 *
 * @property {BN} reserve0 - Amount of the first token (in basic token units)
 * @property {BN} reserve1 - Amount of the second token (in basic token units)
 * @property {Address | null} token0WalletAddress - Address of the first Jetton token
 * @property {Address | null} token1WalletAddress - Address of the second Jetton token
 * @property {BN} lpFee - Liquidity pool fee value
 * @property {BN} protocolFee - Protocol fee
 * @property {BN} refFee - Referral fee
 * @property {Address | null} protocolFeeAddress - Address for receiving protocol fees
 * @property {BN} collectedToken0ProtocolFee - Amount of collected protocol fees of the first token (in basic token units)
 * @property {BN} collectedToken1ProtocolFee - Amount of collected protocol fees of the second token (in basic token units)
 */
export type PoolData = {
  reserve0: BN;
  reserve1: BN;
  token0WalletAddress: Address | null;
  token1WalletAddress: Address | null;
  lpFee: BN;
  protocolFee: BN;
  refFee: BN;
  protocolFeeAddress: Address | null;
  collectedToken0ProtocolFee: BN;
  collectedToken1ProtocolFee: BN;
};

/**
 * @type {ExpectedOutputsData}
 *
 * @property {BN} jettonToReceive - Amount of tokens received (in basic token units)
 * @property {BN} protocolFeePaid - Amount tokens paid for protocol fees (in basic token units)
 * @property {BN} refFeePaid - Amount tokens paid for referral fees (in basic token units)
 */
export type ExpectedOutputsData = {
  jettonToReceive: BN;
  protocolFeePaid: BN;
  refFeePaid: BN;
};

/**
 * @type {PoolAmountsData}
 *
 * @property {BN} amount0 - Amount of tokens for the first Jetton (in basic token units)
 * @property {BN} amount1 - Amount of tokens for the second Jetton (in basic token units)
 */
export type PoolAmountsData = {
  amount0: BN;
  amount1: BN;
};

interface PoolOptions extends JettonMinterOptions {
  revision: PoolRevision | keyof typeof REVISIONS;
  address: AddressType;
}

/**
 * @type {Pool} represents the pool contract and provide methods to interact with it.
 *
 * The pool is the contract that stores the AMM data for a certain pair and is responsible for handling “swaps” or providing liquidity for a certain pool.
 * For each pair (e.g. WTON/USDT), there is only a single pool contract.
 * The pool is also a Jetton Minter, and handles minting/burning of Liquidity Provider Jettons.
 * All the swap/lp calculations are done in the pool contract.
 */
export class Pool extends JettonMinter {
  private revision: PoolRevision;

  constructor(provider: HttpProvider, { revision, ...options }: PoolOptions) {
    super(provider, options);

    if (typeof revision === 'string') {
      if (!REVISIONS[revision])
        throw Error(`Unknown pool revision: ${revision}`);

      this.revision = new REVISIONS[revision]();
    } else {
      this.revision = revision;
    }
  }

  public get gasConstants(): PoolGasConstants {
    return this.revision.gasConstants;
  }

  /**
   * Create a payload for the `collect_fees` transaction.
   *
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {Cell} payload for the `collect_fees` transaction.
   */
  public async createCollectFeesBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return this.revision.createCollectFeesBody(this, params);
  }

  /**
   * Create a payload for the `burn` transaction.
   *
   * @param {BN | number} params.amount - Amount of lp tokens to burn (in basic token units)
   * @param {Address | string} params.responseAddress - Address of a user
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {Cell} payload for the `burn` transaction.
   */
  public async createBurnBody(params: {
    amount: AmountType;
    responseAddress: AddressType;
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return this.revision.createBurnBody(this, params);
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
  }): Promise<ExpectedOutputsData> {
    return this.revision.getExpectedOutputs(this, params);
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
  }): Promise<BN> {
    return this.revision.getExpectedTokens(this, params);
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
  }): Promise<PoolAmountsData> {
    return this.revision.getExpectedLiquidity(this, params);
  }

  /**
   * @param {Address | string} params.ownerAddress - Address of a user
   *
   * @returns a JettonWallet object for an address returned by getJettonWalletAddress
   */
  public async getJettonWallet(params: {
    ownerAddress: AddressType;
  }): Promise<JettonWallet> {
    const poolWalletAddress = await this.getJettonWalletAddress(
      new Address(params.ownerAddress),
    );
    return new JettonWallet(this.provider, { address: poolWalletAddress });
  }

  /**
   * @param {Address | string} params.ownerAddress - Address of a user
   *
   * @returns the lp account address of a user
   */
  public async getLpAccountAddress(params: {
    ownerAddress: AddressType;
  }): Promise<Address | null> {
    return await this.revision.getLpAccountAddress(this, params);
  }

  /**
   * @param {Address | string} params.ownerAddress - Address of a user
   *
   * @returns {LpAccount} object for address returned by getLpAccountAddress
   */
  public async getLpAccount(params: {
    ownerAddress: AddressType;
  }): Promise<LpAccount | null> {
    const accountAddress = await this.getLpAccountAddress(params);

    if (!accountAddress) return null;

    return new LpAccount(this.provider, {
      address: accountAddress,
      revision: this.revision.constructLpAccountRevision(this),
    });
  }

  /**
   * @returns {PoolData} containing current state of the pool
   */
  public async getData(): Promise<PoolData> {
    return this.revision.getData(this);
  }

  /**
   * Build all data required to execute a `collect_fees` transaction.
   *
   * @param {BN | number | undefined} params.gasAmount - Optional; amount of gas for the transaction (in nanoTons)
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

    return { to, payload, gasAmount };
  }

  /**
   * Build all data required to execute a `burn` transaction.
   *
   * @param {BN | number} params.amount - Amount of lp tokens to burn (in basic token units)
   * @param {Address | string} params.responseAddress - Address of a user
   * @param {BN | number | undefined} params.gasAmount - Optional; amount of gas for the transaction (in nanoTons)
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
    const to = await this.getJettonWalletAddress(
      new Address(params.responseAddress),
    );

    const payload = await this.createBurnBody({
      amount: params.amount,
      responseAddress: params.responseAddress,
      queryId: params.queryId,
    });

    const gasAmount = new BN(params?.gasAmount ?? this.gasConstants.burn);

    return { to, payload, gasAmount };
  }
}
