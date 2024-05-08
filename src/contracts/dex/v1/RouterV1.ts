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
import { createJettonTransferMessage } from "@/utils/createJettonTransferMessage";
import { parseAddress, parseAddressNotNull } from "@/utils/parseAddress";
import { parseBoolean } from "@/utils/parseBoolean";

import { DEX_VERSION, DEX_OP_CODES } from "../constants";

import { PoolV1 } from "./PoolV1";

const {
  utils: { BN, bytesToBase64 },
  boc: { Cell },
  Address,
  Contract,
  token: {
    jetton: { JettonMinter },
  },
} = TonWeb;

export interface RouterV1Options extends SdkContractOptions, ContractOptions {
  gasConstants?: Partial<typeof RouterV1.gasConstants>;
}

/**
 * The router is the contract that acts as an entrypoint for all DEX calls.
 * It is responsible for routing all Jetton calls with transfer_notification op to the correct pool contract.
 * It acts as a sovereign over the DEX, and can be used to lock/unlock trading on all pools,
 * to change fees on a certain pool or to upgrade its own contract. The router is the only contract that can be upgraded.
 * Each Jetton that goes through the DEX is owned by the router. The router does not store anything about pairs.
 */
export class RouterV1 extends Contract {
  public static readonly version = DEX_VERSION.v1;
  public static readonly address = new Address(
    "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt",
  );
  public static readonly gasConstants = {
    swapJettonToJetton: {
      gasAmount: new BN("265000000"),
      forwardGasAmount: new BN("205000000"),
    },
    swapJettonToTon: {
      gasAmount: new BN("185000000"),
      forwardGasAmount: new BN("125000000"),
    },
    swapTonToJetton: {
      forwardGasAmount: new BN("215000000"),
    },
    provideLpJetton: {
      gasAmount: new BN("300000000"),
      forwardGasAmount: new BN("240000000"),
    },
    provideLpTon: {
      forwardGasAmount: new BN("260000000"),
    },
  };

  protected readonly stonApiClient;

  public readonly gasConstants;

  constructor({
    tonApiClient,
    stonApiClient,
    gasConstants,
    ...options
  }: RouterV1Options) {
    super(tonApiClient, {
      ...options,
      address: options.address ?? RouterV1.address,
    });

    this.stonApiClient = stonApiClient ?? new StonApiClient(tonApiClient);
    this.gasConstants = {
      ...RouterV1.gasConstants,
      ...gasConstants,
    };
  }

  public async createSwapBody(params: {
    userWalletAddress: AddressType;
    minAskAmount: AmountType;
    askJettonWalletAddress: AddressType;
    referralAddress?: AddressType;
  }): Promise<Cell> {
    const payload = new Cell();

    payload.bits.writeUint(DEX_OP_CODES.SWAP, 32);
    payload.bits.writeAddress(new Address(params.askJettonWalletAddress));
    payload.bits.writeCoins(new BN(params.minAskAmount));
    payload.bits.writeAddress(new Address(params.userWalletAddress));

    if (params.referralAddress) {
      payload.bits.writeUint(1, 1);
      payload.bits.writeAddress(new Address(params.referralAddress));
    } else {
      payload.bits.writeUint(0, 1);
    }

    return payload;
  }

  /**
   * Build all data required to execute a jetton to jetton `swap` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {Address | string} params.offerJettonAddress - Jetton address of a token to be swapped
   * @param {Address | string} params.askJettonAddress - Jetton address of a token to be received
   * @param {BN | number} params.offerAmount - Amount of tokens to be swapped (in basic token units)
   * @param {BN | number} params.minAskAmount - Minimum amount of tokens received (in basic token units)
   * @param {Address | string | undefined} params.referralAddress - Optional; referral address
   * @param {BN | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {BN | number | string | undefined} params.forwardGasAmount - Optional; Custom transaction forward gas amount (in nanoTons)
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} data required to execute a jetton `swap` transaction
   */
  public async buildSwapJettonToJettonTxParams(params: {
    userWalletAddress: AddressType;
    offerJettonAddress: AddressType;
    askJettonAddress: AddressType;
    offerAmount: AmountType;
    minAskAmount: AmountType;
    referralAddress?: AddressType;
    gasAmount?: AmountType;
    forwardGasAmount?: AmountType;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const contractAddress = await this.getAddress();

    const [offerJettonWalletAddress, askJettonWalletAddress] =
      await Promise.all([
        (async () =>
          new Address(
            await this.stonApiClient.getJettonWalletAddress({
              jettonAddress: params.offerJettonAddress.toString(),
              ownerAddress: params.userWalletAddress.toString(),
            }),
          ))(),
        (async () =>
          new Address(
            await this.stonApiClient.getJettonWalletAddress({
              jettonAddress: params.askJettonAddress.toString(),
              ownerAddress: contractAddress.toString(),
            }),
          ))(),
      ]);

    const forwardPayload = await this.createSwapBody({
      userWalletAddress: params.userWalletAddress,
      minAskAmount: params.minAskAmount,
      askJettonWalletAddress: askJettonWalletAddress,
      referralAddress: params.referralAddress,
    });

    const forwardTonAmount = new BN(
      params.forwardGasAmount ??
        this.gasConstants.swapJettonToJetton.forwardGasAmount,
    );

    const payload = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.offerAmount,
      destination: contractAddress,
      responseDestination: params.userWalletAddress,
      forwardTonAmount,
      forwardPayload,
    });

    const gasAmount = new BN(
      params.gasAmount ?? this.gasConstants.swapJettonToJetton.gasAmount,
    );

    return {
      to: new Address(offerJettonWalletAddress.toString(true, true, true)),
      payload,
      gasAmount,
    };
  }

  /**
   * Build all data required to execute a jetton to ton `swap` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {Address | string} params.offerJettonAddress - Jetton address of a token to be swapped
   * @param {Address | string} params.proxyTonAddress - Address of a proxy ton contract
   * @param {BN | number} params.offerAmount - Amount of tokens to be swapped (in basic token units)
   * @param {BN | number} params.minAskAmount - Minimum amount of tokens received (in basic token units)
   * @param {Address | string | undefined} params.referralAddress - Optional; referral address
   * @param {BN | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {BN | number | string | undefined} params.forwardGasAmount - Optional; Custom transaction forward gas amount (in nanoTons)
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} data required to execute a jetton `swap` transaction
   */
  public async buildSwapJettonToTonTxParams(params: {
    userWalletAddress: AddressType;
    offerJettonAddress: AddressType;
    proxyTonAddress: AddressType;
    offerAmount: AmountType;
    minAskAmount: AmountType;
    referralAddress?: AddressType;
    gasAmount?: AmountType;
    forwardGasAmount?: AmountType;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    return await this.buildSwapJettonToJettonTxParams({
      ...params,
      askJettonAddress: params.proxyTonAddress,
      gasAmount:
        params.gasAmount ?? this.gasConstants.swapJettonToTon.gasAmount,
      forwardGasAmount:
        params.forwardGasAmount ??
        this.gasConstants.swapJettonToTon.forwardGasAmount,
    });
  }

  /**
   * Build all data required to execute a ton to jetton `swap` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {Address | string} params.proxyTonAddress - Address of a proxy ton contract
   * @param {Address | string} params.askJettonAddress - Jetton address of a token to be received
   * @param {BN | number} params.offerAmount - Amount of ton to be swapped (in nanoTons)
   * @param {BN | number} params.minAskAmount - Minimum amount of tokens received (in basic token units)
   * @param {Address | string | undefined} params.referralAddress - Optional; Referral address
   * @param {BN | number | string | undefined} params.forwardGasAmount - Optional; Custom transaction forward gas amount (in nanoTons)
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} data required to execute a ton to jetton `swap` transaction
   */
  public async buildSwapTonToJettonTxParams(params: {
    userWalletAddress: AddressType;
    proxyTonAddress: AddressType;
    askJettonAddress: AddressType;
    offerAmount: AmountType;
    minAskAmount: AmountType;
    referralAddress?: AddressType | undefined;
    forwardGasAmount?: AmountType;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const contractAddress = await this.getAddress();

    const [proxyTonWalletAddress, askJettonWalletAddress] = await Promise.all([
      (async () =>
        new Address(
          await this.stonApiClient.getJettonWalletAddress({
            jettonAddress: params.proxyTonAddress.toString(),
            ownerAddress: contractAddress.toString(),
          }),
        ))(),
      (async () =>
        new Address(
          await this.stonApiClient.getJettonWalletAddress({
            jettonAddress: params.askJettonAddress.toString(),
            ownerAddress: contractAddress.toString(),
          }),
        ))(),
    ]);

    const forwardPayload = await this.createSwapBody({
      userWalletAddress: params.userWalletAddress,
      minAskAmount: params.minAskAmount,
      askJettonWalletAddress: askJettonWalletAddress,
      referralAddress: params.referralAddress,
    });

    const forwardTonAmount = new BN(
      params.forwardGasAmount ??
        this.gasConstants.swapTonToJetton.forwardGasAmount,
    );

    const payload = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.offerAmount,
      destination: contractAddress,
      forwardTonAmount,
      forwardPayload,
    });

    const gasAmount = new BN(params.offerAmount).add(forwardTonAmount);

    return {
      to: new Address(proxyTonWalletAddress.toString(true, true, true)),
      payload,
      gasAmount,
    };
  }

  public async createProvideLiquidityBody(params: {
    routerWalletAddress: AddressType;
    minLpOut: AmountType;
  }): Promise<Cell> {
    const payload = new Cell();

    payload.bits.writeUint(DEX_OP_CODES.PROVIDE_LIQUIDITY, 32);
    payload.bits.writeAddress(new Address(params.routerWalletAddress));
    payload.bits.writeCoins(new BN(params.minLpOut));

    return payload;
  }

  /**
   * Collect all data required to execute a jetton `provide_lp` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {Address | string} params.sendTokenAddress - Address of the provided Jetton token
   * @param {Address | string} params.otherTokenAddress - Address of the other Jetton token in pair
   * @param {BN | number} params.sendAmount - Amount of the first token deposited as liquidity (in basic token units)
   * @param {BN | number} params.minLpOut - Minimum amount of created liquidity tokens (in basic token units)
   * @param {BN | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {BN | number | string | undefined} params.forwardGasAmount - Optional; Custom transaction forward gas amount (in nanoTons)
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
    const contractAddress = await this.getAddress();

    const [jettonWalletAddress, routerWalletAddress] = await Promise.all([
      (async () =>
        new Address(
          await this.stonApiClient.getJettonWalletAddress({
            jettonAddress: params.sendTokenAddress.toString(),
            ownerAddress: params.userWalletAddress.toString(),
          }),
        ))(),
      (async () =>
        new Address(
          await this.stonApiClient.getJettonWalletAddress({
            jettonAddress: params.otherTokenAddress.toString(),
            ownerAddress: contractAddress.toString(),
          }),
        ))(),
    ]);

    const forwardPayload = await this.createProvideLiquidityBody({
      routerWalletAddress: routerWalletAddress,
      minLpOut: params.minLpOut,
    });

    const forwardTonAmount = new BN(
      params.forwardGasAmount ??
        this.gasConstants.provideLpJetton.forwardGasAmount,
    );

    const payload = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.sendAmount,
      destination: contractAddress,
      responseDestination: params.userWalletAddress,
      forwardTonAmount,
      forwardPayload,
    });

    const gasAmount = new BN(
      params.gasAmount ?? this.gasConstants.provideLpJetton.gasAmount,
    );

    return {
      to: new Address(jettonWalletAddress.toString(true, true, true)),
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
   * @param {BN | number | string | undefined} params.forwardGasAmount - Optional; Custom transaction forward gas amount (in nanoTons)
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} data required to execute a proxy ton `provide_lp` transaction
   */
  public async buildProvideLiquidityTonTxParams(params: {
    userWalletAddress: AddressType;
    proxyTonAddress: AddressType;
    otherTokenAddress: AddressType;
    sendAmount: AmountType;
    minLpOut: AmountType;
    forwardGasAmount?: AmountType;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const contractAddress = await this.getAddress();

    const [proxyTonWalletAddress, routerWalletAddress] = await Promise.all([
      (async () =>
        new Address(
          await this.stonApiClient.getJettonWalletAddress({
            jettonAddress: params.proxyTonAddress.toString(),
            ownerAddress: contractAddress.toString(),
          }),
        ))(),
      (async () =>
        new Address(
          await this.stonApiClient.getJettonWalletAddress({
            jettonAddress: params.otherTokenAddress.toString(),
            ownerAddress: contractAddress.toString(),
          }),
        ))(),
    ]);

    const forwardPayload = await this.createProvideLiquidityBody({
      routerWalletAddress: routerWalletAddress,
      minLpOut: params.minLpOut,
    });

    const forwardTonAmount = new BN(
      params.forwardGasAmount ??
        this.gasConstants.provideLpTon.forwardGasAmount,
    );

    const payload = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.sendAmount,
      destination: contractAddress,
      forwardTonAmount,
      forwardPayload,
    });

    const gasAmount = new BN(params.sendAmount).add(forwardTonAmount);

    return {
      to: new Address(proxyTonWalletAddress.toString(true, true, true)),
      payload,
      gasAmount,
    };
  }

  /**
   * **Note:** It's necessary to specify addresses of Jetton wallets of the router as the arguments of this method.
   * These addresses can be retrieved with getJettonWalletAddress of the Jetton minter.
   *
   * @param {Address | string} params.token0 - The address of the router's wallet of first Jetton
   * @param {Address | string} params.token1 - The address of the router's wallet of second Jetton
   *
   * @returns {Address | null} an address of a pool for a specified pair of assets.
   */
  public async getPoolAddress(params: {
    token0: AddressType;
    token1: AddressType;
  }) {
    const cellA = new Cell();
    cellA.bits.writeAddress(new Address(params.token0));

    const cellB = new Cell();
    cellB.bits.writeAddress(new Address(params.token1));

    const sliceA = bytesToBase64(await cellA.toBoc(false));
    const sliceB = bytesToBase64(await cellB.toBoc(false));

    const contractAddress = await this.getAddress();

    const result = await this.provider.call2(
      contractAddress.toString(),
      "get_pool_address",
      [
        ["tvm.Slice", sliceA],
        ["tvm.Slice", sliceB],
      ],
    );

    return parseAddress(result);
  }

  /**
   * @param {Address | string} params.token0 - The address of the first Jetton minter
   * @param {Address | string} params.token1 - The address of the second Jetton minter
   *
   * @returns {Pool} object for a pool with specified Jetton token addresses.
   */
  public async getPool(params: {
    token0: AddressType;
    token1: AddressType;
  }) {
    const jetton0 = new JettonMinter(
      this.provider,
      // @ts-expect-error - not all parameters are really required here
      {
        address: params.token0,
      },
    );

    const jetton1 = new JettonMinter(
      this.provider,
      // @ts-expect-error - not all parameters are really required here
      {
        address: params.token1,
      },
    );

    const contractAddress = await this.getAddress();

    const [jetton0WalletAddress, jetton1WalletAddress] = await Promise.all([
      this.stonApiClient.getJettonWalletAddress({
        jettonAddress: (await jetton0.getAddress()).toString(),
        ownerAddress: contractAddress.toString(),
      }),
      this.stonApiClient.getJettonWalletAddress({
        jettonAddress: (await jetton1.getAddress()).toString(),
        ownerAddress: contractAddress.toString(),
      }),
    ]);

    const poolAddress = await this.getPoolAddress({
      token0: jetton0WalletAddress,
      token1: jetton1WalletAddress,
    });

    if (!poolAddress) return null;

    return new PoolV1({
      tonApiClient: this.provider,
      stonApiClient: this.stonApiClient,
      address: poolAddress,
    });
  }

  /**
   * @returns current state of the router.
   */
  public async getData() {
    const contractAddress = await this.getAddress();

    const result = await this.provider.call2(
      contractAddress.toString(),
      "get_router_data",
      [],
    );

    return {
      isLocked: parseBoolean(result[0]),
      adminAddress: parseAddressNotNull(result[1] as Cell),
      tempUpgrade: result[2] as Cell,
      poolCode: result[3] as Cell,
      jettonLpWalletCode: result[4] as Cell,
      lpAccountCode: result[5] as Cell,
    };
  }
}
