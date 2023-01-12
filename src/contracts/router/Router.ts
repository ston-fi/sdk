import TonWeb from 'tonweb';

import type { Pool } from '@/contracts/pool/Pool';
import { ROUTER_REVISION } from '@/constants';
import type {
  Address,
  Cell,
  Contract,
  HttpProvider,
  JettonMinter,
  BN,
  AddressType,
  ContractOptions,
  MessageData,
} from '@/types';

import type { RouterGasConstants, RouterRevision } from './RouterRevision';
import { RouterRevisionV1 } from './RouterRevisionV1';

const {
  Address,
  Contract,
  token: {
    jetton: { JettonMinter },
  },
} = TonWeb;

const REVISIONS = {
  [ROUTER_REVISION.V1]: RouterRevisionV1,
} as const;

/**
 * @type {RouterData} containing state of the router
 *
 * @property {boolean} isLocked - true if transfer_notification operations are locked (swap, provide_lp)
 * @property {Address} adminAddress - Address of contract's admin account
 * @property {Cell} tempUpgrade - A structure describing state of contract's code & admin upgrade; zero values indicate that no upgrade is pending
 * @property {Cell} poolCode - Code of the router's liquidity pool contract
 * @property {Cell} jettonLpWalletCode - Code of lp wallet contract
 * @property {Cell} lpAccountCode - Code of lp account contract
 */
export type RouterData = {
  isLocked: boolean;
  adminAddress: Address | null;
  tempUpgrade: Cell;
  poolCode: Cell;
  jettonLpWalletCode: Cell;
  lpAccountCode: Cell;
};

interface RouterOptions extends ContractOptions {
  address: AddressType;
  revision: RouterRevision | keyof typeof REVISIONS;
}

/**
 * @type {Router} represents the router contract and provide methods to interact with it.
 *
 * The router is the contract that acts as an entrypoint for all DEX calls.
 * It is responsible for routing all Jetton calls with transfer_notification op to the correct pool contract.
 * It acts as a sovereign over the DEX, and can be used to lock/unlock trading on all pools,
 * to change fees on a certain pool or to upgrade its own contract. The router is the only contract that can be upgraded.
 * Each Jetton that goes through the DEX is owned by the router. The router does not store anything about pairs.
 */
export class Router extends Contract {
  private revision: RouterRevision;

  constructor(provider: HttpProvider, { revision, ...options }: RouterOptions) {
    super(provider, options);

    if (typeof revision === 'string') {
      if (!REVISIONS[revision])
        throw Error(`Unknown router revision: ${revision}`);

      this.revision = new REVISIONS[revision]();
    } else {
      this.revision = revision;
    }
  }

  public get gasConstants(): RouterGasConstants {
    return this.revision.gasConstants;
  }

  /**
   * Create a payload for the `swap` transaction.
   *
   * @param {AddressType} params.userWalletAddress - User's address
   * @param {BN} params.offerAmount - Amount of tokens to be swapped (in basic token units)
   * @param {BN} params.minAskAmount - Minimum amount of tokens received (in basic token units)
   * @param {AddressType} params.askJettonWalletAddress - Jetton router's wallet address of tokens to be received
   * @param {BN | undefined} params.forwardGasAmount - Optional; forward amount of gas for the next transaction (in nanoTons)
   * @param {BN | undefined} params.queryId - Optional; query id
   *
   * @returns {Cell} payload for the `swap` transaction.
   */
  public async createSwapBody(params: {
    userWalletAddress: AddressType;
    offerAmount: BN;
    minAskAmount: BN;
    askJettonWalletAddress: AddressType;
    forwardGasAmount?: BN;
    queryId?: BN;
  }): Promise<Cell> {
    return this.revision.createSwapBody(this, params);
  }

  /**
   * Create a payload for the `provide_lp` transaction.
   *
   * @param {AddressType} params.routerWalletAddress - Address of the router's Jetton token wallet
   * @param {BN} params.lpAmount - Amount of deposited tokens as liquidity (in basic token units)
   * @param {BN} params.minLpOut - Minimum amount of created liquidity tokens (in basic token units)
   * @param {BN | undefined} params.forwardGasAmount - Optional; forward amount of gas for the next transaction (in nanoTons)
   * @param {BN | undefined} params.queryId - Optional; query id
   *
   * @returns payload for the `provide_lp` transaction.
   */
  public async createProvideLiquidityBody(params: {
    routerWalletAddress: AddressType;
    lpAmount: BN;
    minLpOut: BN;
    forwardGasAmount?: BN;
    queryId?: BN;
  }): Promise<Cell> {
    return this.revision.createProvideLiquidityBody(this, params);
  }

  /**
   * **Note:** It's necessary to specify addresses of Jetton wallets of the router as the arguments of this method.
   * These addresses can be retrieved with getJettonWalletAddress of the Jetton minter.
   * @param {AddressType} token0 - The address of the router's wallet of first Jetton
   * @param {AddressType} token1 - The address of the router's wallet of second Jetton
   *
   * @returns {Address | null} an address of a pool for a specified pair of assets.
   */
  public async getPoolAddress(params: {
    token0: AddressType;
    token1: AddressType;
  }): Promise<Address | null> {
    return this.revision.getPoolAddress(this, params);
  }

  /**
   * @param {[AddressType, AddressType]} params.jettonAddresses - Tuple of Jetton addresses of a pool
   *
   * @returns {Pool} object for a pool with specified Jetton token addresses.
   */
  public async getPool(params: {
    jettonAddresses: [AddressType, AddressType];
  }): Promise<Pool | null> {
    const jetton0 = new JettonMinter(
      this.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: params.jettonAddresses[0],
      },
    );

    const jetton1 = new JettonMinter(
      this.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: params.jettonAddresses[1],
      },
    );

    const routerAddress = await this.getAddress();
    const jetton0WalletAddress = await jetton0.getJettonWalletAddress(
      routerAddress,
    );
    const jetton1WalletAddress = await jetton1.getJettonWalletAddress(
      routerAddress,
    );

    const poolAddress = await this.getPoolAddress({
      token0: jetton0WalletAddress,
      token1: jetton1WalletAddress,
    });

    if (!poolAddress) return null;

    return this.revision.constructPool(this, poolAddress);
  }

  /**
   * @returns {RouterData} containing current state of the router.
   */
  public async getData(): Promise<RouterData> {
    return await this.revision.getData(this);
  }

  /**
   * Build all data required to execute a `swap` transaction.
   *
   * @param {AddressType} params.userWalletAddress - User's address
   * @param {AddressType} params.offerJettonAddress - Jetton address of a token to be swapped
   * @param {AddressType} params.askJettonAddress - Jetton address of a token to be received
   * @param {BN} params.offerAmount - Amount of tokens to be swapped (in basic token units)
   * @param {BN} params.minAskAmount - Minimum amount of tokens received (in basic token units)
   * @param {BN | undefined} params.forwardGasAmount - Optional; forward amount of gas for the next transaction (in nanoTons)
   * @param {BN | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} data required to execute a `swap` transaction.
   */
  public async buildSwapTxParams(params: {
    userWalletAddress: AddressType;
    offerJettonAddress: AddressType;
    askJettonAddress: AddressType;
    offerAmount: BN;
    minAskAmount: BN;
    forwardGasAmount?: BN;
    queryId?: BN;
  }): Promise<MessageData> {
    const offerJetton = new JettonMinter(
      this.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: params.offerJettonAddress,
      },
    );

    const askJetton = new JettonMinter(
      this.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: params.askJettonAddress,
      },
    );

    const offerJettonWalletAddress = await offerJetton.getJettonWalletAddress(
      new Address(params.userWalletAddress),
    );
    const askJettonWalletAddress = await askJetton.getJettonWalletAddress(
      await this.getAddress(),
    );

    const payload = await this.createSwapBody({
      userWalletAddress: params.userWalletAddress,
      offerAmount: params.offerAmount,
      minAskAmount: params.minAskAmount,
      askJettonWalletAddress: askJettonWalletAddress,
      forwardGasAmount: params.forwardGasAmount,
      queryId: params.queryId,
    });

    return {
      to: offerJettonWalletAddress,
      payload: payload,
      gasAmount: this.gasConstants.swap,
    };
  }

  /**
   * Collect all data required to execute a `provide_lp` transaction  for the first Jetton token of the pair.
   *
   * @param {AddressType} params.userWalletAddress - User's address
   * @param {AddressType} params.jettonAddresses.token0 - Address of the first Jetton token
   * @param {AddressType} params.jettonAddresses.token1 - Address of the second Jetton token
   * @param {BN} params.lpAmount0 - Amount of the first token deposited as liquidity (in basic token units)
   * @param {BN} params.minLpOut - Minimum amount of created liquidity tokens (in basic token units)
   * @param {BN | undefined} params.forwardGasAmount - Optional; forward amount of gas for the next transaction (in nanoTons)
   * @param {BN | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} data required to execute a `provide_lp` transaction  for the first Jetton token of the pair.
   */
  public async buildProvideLiquidityTxParamsToken0(params: {
    userWalletAddress: AddressType;
    jettonAddresses: {
      token0: AddressType;
      token1: AddressType;
    };
    lpAmount0: BN;
    minLpOut: BN;
    forwardGasAmount?: BN;
    queryId?: BN;
  }): Promise<MessageData> {
    const jetton0 = new JettonMinter(
      this.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: params.jettonAddresses.token0,
      },
    );

    const jetton1 = new JettonMinter(
      this.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: params.jettonAddresses.token1,
      },
    );

    const jettonWalletAddress = await jetton0.getJettonWalletAddress(
      new Address(params.userWalletAddress),
    );
    const routerWalletAddress = await jetton1.getJettonWalletAddress(
      await this.getAddress(),
    );

    const payload = await this.createProvideLiquidityBody({
      routerWalletAddress: routerWalletAddress,
      lpAmount: params.lpAmount0,
      minLpOut: params.minLpOut,
      forwardGasAmount: params.forwardGasAmount,
      queryId: params.queryId,
    });

    return {
      to: jettonWalletAddress,
      payload: payload,
      gasAmount: this.gasConstants.provideLp,
    };
  }

  /**
   * Build all data required to execute a `provide_lp` transaction for the second Jetton token of the pair.
   *
   * @param {AddressType} params.userWalletAddress -  User's address
   * @param {AddressType} params.jettonAddresses.token0 - Address of the first Jetton token
   * @param {AddressType} params.jettonAddresses.token1 - Address of the second Jetton token
   * @param {BN} params.lpAmount1 - Amount of the second token deposited as liquidity (in basic token units)
   * @param {BN} params.minLpOut - Minimum amount of created liquidity tokens (in basic token units)
   * @param {BN | undefined} params.forwardGasAmount - Optional; forward amount of gas for the next transaction (in nanoTons)
   * @param {BN | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} data required to execute a `provide_lp` transaction for the second Jetton token of the pair.
   */
  public async buildProvideLiquidityTxParamsToken1(params: {
    userWalletAddress: AddressType;
    jettonAddresses: {
      token0: AddressType;
      token1: AddressType;
    };
    lpAmount1: BN;
    minLpOut: BN;
    forwardGasAmount?: BN;
    queryId?: BN;
  }): Promise<MessageData> {
    const jetton0 = new JettonMinter(
      this.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: params.jettonAddresses.token0,
      },
    );

    const jetton1 = new JettonMinter(
      this.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: params.jettonAddresses.token1,
      },
    );

    const jettonWalletAddress = await jetton1.getJettonWalletAddress(
      new Address(params.userWalletAddress),
    );
    const routerWalletAddress = await jetton0.getJettonWalletAddress(
      await this.getAddress(),
    );

    const payload = await this.createProvideLiquidityBody({
      routerWalletAddress: routerWalletAddress,
      lpAmount: params.lpAmount1,
      minLpOut: params.minLpOut,
      forwardGasAmount: params.forwardGasAmount,
      queryId: params.queryId,
    });

    return {
      to: jettonWalletAddress,
      payload: payload,
      gasAmount: this.gasConstants.provideLp,
    };
  }
}
