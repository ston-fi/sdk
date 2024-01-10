import TonWeb from 'tonweb';

import { Pool } from '../pool/Pool';
import { ROUTER_REVISION } from '../constants';
import { createJettonTransferMessage } from '@/utils/createJettonTransferMessage';
import type {
  Address,
  Cell,
  Contract,
  HttpProvider,
  JettonMinter,
  AddressType,
  AmountType,
  MessageData,
  QueryIdType,
  ContractOptions,
} from '@/types';

import type { RouterGasConstants, RouterRevision } from './RouterRevision';
import { RouterRevisionV1 } from './RouterRevisionV1';
import { sleep } from '@/utils';

const {
  Address,
  Contract,
  utils: { BN },
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
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {BN | number} params.minAskAmount - Minimum amount of tokens received (in basic token units)
   * @param {Address | string} params.askJettonWalletAddress - Jetton router's wallet address of tokens to be received
   * @param {Address | string | undefined} params.referralAddress - Optional; referral address
   *
   * @returns {Cell} payload for the `swap` transaction.
   */
  public async createSwapBody(params: {
    userWalletAddress: AddressType;
    minAskAmount: AmountType;
    askJettonWalletAddress: AddressType;
    referralAddress?: AddressType;
  }): Promise<Cell> {
    return this.revision.createSwapBody(this, params);
  }

  /**
   * Create a payload for the `provide_lp` transaction.
   *
   * @param {Address | string} params.routerWalletAddress - Address of the router's Jetton token wallet
   * @param {BN | number} params.minLpOut - Minimum amount of created liquidity tokens (in basic token units)
   *
   * @returns payload for the `provide_lp` transaction.
   */
  public async createProvideLiquidityBody(params: {
    routerWalletAddress: AddressType;
    minLpOut: AmountType;
  }): Promise<Cell> {
    return this.revision.createProvideLiquidityBody(this, params);
  }

  /**
   * **Note:** It's necessary to specify addresses of Jetton wallets of the router as the arguments of this method.
   * These addresses can be retrieved with getJettonWalletAddress of the Jetton minter.
   * @param {Address | string} params.token0 - The address of the router's wallet of first Jetton
   * @param {Address | string} params.token1 - The address of the router's wallet of second Jetton
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
   * @param {[Address | string, Address | string]} params.jettonAddresses - Tuple of Jetton addresses of a pool
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

    return new Pool(
      this.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: poolAddress,
        revision: this.revision.constructPoolRevision(this),
      },
    );
  }

  /**
   * @returns {RouterData} containing current state of the router.
   */
  public async getData(): Promise<RouterData> {
    return await this.revision.getData(this);
  }

  /**
   * Build all data required to execute a jetton `swap` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {Address | string} params.offerJettonAddress - Jetton address of a token to be swapped
   * @param {Address | string} params.askJettonAddress - Jetton address of a token to be received
   * @param {BN | number} params.offerAmount - Amount of tokens to be swapped (in basic token units)
   * @param {BN | number} params.minAskAmount - Minimum amount of tokens received (in basic token units)
   * @param {BN | number | undefined} params.gasAmount - Optional; amount of gas for the transaction (in nanoTons)
   * @param {BN | number | undefined} params.forwardGasAmount - Optional; forward amount of gas for the next transaction (in nanoTons)
   * @param {Address | string | undefined} params.referralAddress - Optional; referral address
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} data required to execute a jetton `swap` transaction
   */
  public async buildSwapJettonTxParams(params: {
    userWalletAddress: AddressType;
    offerJettonAddress: AddressType;
    askJettonAddress: AddressType;
    offerAmount: AmountType;
    minAskAmount: AmountType;
    gasAmount?: AmountType;
    forwardGasAmount?: AmountType;
    referralAddress?: AddressType;
    queryId?: QueryIdType;
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

    const forwardPayload = await this.createSwapBody({
      userWalletAddress: params.userWalletAddress,
      minAskAmount: params.minAskAmount,
      askJettonWalletAddress: askJettonWalletAddress,
      referralAddress: params.referralAddress,
    });

    const forwardTonAmount = new BN(
      params.forwardGasAmount ?? this.gasConstants.swapForward,
    );

    const payload = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.offerAmount,
      destination: await this.getAddress(),
      forwardTonAmount,
      forwardPayload,
    });

    const gasAmount = new BN(params.gasAmount ?? this.gasConstants.swap);

    return {
      to: offerJettonWalletAddress,
      payload,
      gasAmount,
    };
  }

  /**
   * Build all data required to execute a ton to jetton `swap` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {Address | string} params.proxyTonAddress - Address of a proxy ton contract
   * @param {Address | string} params.askJettonAddress - Jetton address of a token to be received
   * @param {BN | number} params.offerAmount - Amount of ton to be swapped (in nanoTons)
   * @param {BN | number} params.minAskAmount - Minimum amount of tokens received (in basic token units)
   * @param {BN | number | undefined} params.forwardGasAmount - Optional; forward amount of gas for the next transaction (in nanoTons)
   * @param {Address | string | undefined} params.referralAddress - Optional; referral address
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} data required to execute a ton to jetton `swap` transaction
   */
  public async buildSwapProxyTonTxParams(params: {
    userWalletAddress: AddressType;
    proxyTonAddress: AddressType;
    askJettonAddress: AddressType;
    offerAmount: AmountType;
    minAskAmount: AmountType;
    forwardGasAmount?: AmountType;
    referralAddress?: AddressType | undefined;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const proxyTonMinter = new JettonMinter(
      this.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: params.proxyTonAddress,
      },
    );

    const askJettonMinter = new JettonMinter(
      this.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: params.askJettonAddress,
      },
    );

    const proxyTonWalletAddress = await proxyTonMinter.getJettonWalletAddress(
      await this.getAddress(),
    );

      await sleep(1500);

    const askJettonWalletAddress = await askJettonMinter.getJettonWalletAddress(
      await this.getAddress(),
    );

    const forwardPayload = await this.createSwapBody({
      userWalletAddress: params.userWalletAddress,
      minAskAmount: params.minAskAmount,
      askJettonWalletAddress: askJettonWalletAddress,
      referralAddress: params.referralAddress,
    });

    const forwardTonAmount = new BN(
      params.forwardGasAmount ?? this.gasConstants.swapForward,
    );

    const payload = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.offerAmount,
      destination: await this.getAddress(),
      forwardTonAmount,
      forwardPayload,
    });

    const gasAmount = new BN(params.offerAmount).add(forwardTonAmount);

    return {
      to: proxyTonWalletAddress,
      payload,
      gasAmount,
    };
  }

  /**
   * Collect all data required to execute a jetton `provide_lp` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {Address | string} params.sendTokenAddress - Address of the provided Jetton token
   * @param {Address | string} params.otherTokenAddress - Address of the other Jetton token in pair
   * @param {BN | number} params.sendAmount - Amount of the first token deposited as liquidity (in basic token units)
   * @param {BN | number} params.minLpOut - Minimum amount of created liquidity tokens (in basic token units)
   * @param {BN | number | undefined} params.gasAmount - Optional; amount of gas for the transaction (in nanoTons)
   * @param {BN | number | undefined} params.forwardGasAmount - Optional; forward amount of gas for the next transaction (in nanoTons)
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} data required to execute a jetton `provide_lp` transaction
   */
  public async buildProvideLiquidityJettonTxParams(params: {
    userWalletAddress: AddressType;
    sendTokenAddress: AddressType;
    otherTokenAddress: AddressType;
    sendAmount: AmountType;
    minLpOut: AmountType;
    gasAmount?: AmountType;
    forwardGasAmount?: AmountType;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const sendJettonMinter = new JettonMinter(
      this.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: params.sendTokenAddress,
      },
    );

    const otherJettonMinter = new JettonMinter(
      this.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: params.otherTokenAddress,
      },
    );

    const jettonWalletAddress = await sendJettonMinter.getJettonWalletAddress(
      new Address(params.userWalletAddress),
    );
    const routerWalletAddress = await otherJettonMinter.getJettonWalletAddress(
      await this.getAddress(),
    );

    const forwardPayload = await this.createProvideLiquidityBody({
      routerWalletAddress: routerWalletAddress,
      minLpOut: params.minLpOut,
    });

    const forwardTonAmount = new BN(
      params.forwardGasAmount ?? this.gasConstants.provideLpForward,
    );

    const payload = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.sendAmount,
      destination: await this.getAddress(),
      forwardTonAmount,
      forwardPayload,
    });

    const gasAmount = new BN(params.gasAmount ?? this.gasConstants.provideLp);

    return {
      to: jettonWalletAddress,
      payload,
      gasAmount,
    };
  }

  /**
   * Collect all data required to execute a proxy ton `provide_lp` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {Address | string} params.proxyTonAddress - Address of a proxy ton contract
   * @param {Address | string} params.otherTokenAddress - Address of the other Jetton token in pair
   * @param {BN | number} params.sendAmount - Amount of ton deposited as liquidity (in nanoTons)
   * @param {BN | number} params.minLpOut - Minimum amount of created liquidity tokens (in basic token units)
   * @param {BN | number | undefined} params.forwardGasAmount - Optional; forward amount of gas for the next transaction (in nanoTons)
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} data required to execute a proxy ton `provide_lp` transaction
   */
  public async buildProvideLiquidityProxyTonTxParams(params: {
    userWalletAddress: AddressType;
    proxyTonAddress: AddressType;
    otherTokenAddress: AddressType;
    sendAmount: AmountType;
    minLpOut: AmountType;
    forwardGasAmount?: AmountType;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const tonProxyMinter = new JettonMinter(
      this.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: params.proxyTonAddress,
      },
    );

    const otherJettonMinter = new JettonMinter(
      this.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: params.otherTokenAddress,
      },
    );

    const proxyTonWalletAddress = await tonProxyMinter.getJettonWalletAddress(
      await this.getAddress(),
    );
    const routerWalletAddress = await otherJettonMinter.getJettonWalletAddress(
      await this.getAddress(),
    );

    const forwardPayload = await this.createProvideLiquidityBody({
      routerWalletAddress: routerWalletAddress,
      minLpOut: params.minLpOut,
    });

    const forwardTonAmount = new BN(
      params.forwardGasAmount ?? this.gasConstants.provideLp,
    );

    const payload = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.sendAmount,
      destination: await this.getAddress(),
      forwardTonAmount,
      forwardPayload,
    });

    const gasAmount = new BN(params.sendAmount).add(forwardTonAmount);

    return {
      to: proxyTonWalletAddress,
      payload,
      gasAmount,
    };
  }
}
