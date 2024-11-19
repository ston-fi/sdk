import {
  type Cell,
  type ContractProvider,
  type Sender,
  type SenderArguments,
  address,
  beginCell,
  toNano,
} from "@ton/ton";

import type { AddressType, AmountType, QueryIdType } from "../../../types";
import { createJettonTransferMessage } from "../../../utils/createJettonTransferMessage";
import { toAddress } from "../../../utils/toAddress";
import { Contract, type ContractOptions } from "../../core/Contract";
import { JettonMinter } from "../../core/JettonMinter";
import type { PtonV1 } from "../../pTON/v1/PtonV1";
import { DEX_VERSION } from "../constants";
import * as Errors from "../errors";
import { PoolV1 } from "./PoolV1";
import { DEX_OP_CODES, ROUTER_ADDRESS } from "./constants";

export interface RouterV1Options extends ContractOptions {
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
  public static readonly version: DEX_VERSION = DEX_VERSION.v1;
  public static readonly address = address(ROUTER_ADDRESS);
  public static readonly gasConstants = {
    swapJettonToJetton: {
      gasAmount: toNano("0.22"),
      forwardGasAmount: toNano("0.175"),
    },
    swapJettonToTon: {
      gasAmount: toNano("0.17"),
      forwardGasAmount: toNano("0.125"),
    },
    swapTonToJetton: {
      forwardGasAmount: toNano("0.185"),
    },
    provideLpJetton: {
      gasAmount: toNano("0.3"),
      forwardGasAmount: toNano("0.24"),
    },
    provideLpTon: {
      forwardGasAmount: toNano("0.26"),
    },
  };

  public readonly gasConstants;

  constructor(
    address: AddressType = RouterV1.address,
    { gasConstants, ...options }: RouterV1Options = {},
  ) {
    super(address, options);

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
    const builder = beginCell();

    builder.storeUint(DEX_OP_CODES.SWAP, 32);
    builder.storeAddress(toAddress(params.askJettonWalletAddress));
    builder.storeCoins(BigInt(params.minAskAmount));
    builder.storeAddress(toAddress(params.userWalletAddress));

    if (params.referralAddress) {
      builder.storeUint(1, 1);
      builder.storeAddress(toAddress(params.referralAddress));
    } else {
      builder.storeUint(0, 1);
    }

    return builder.endCell();
  }

  /**
   * Build all data required to execute a jetton to jetton `swap` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {Address | string} params.offerJettonAddress - Jetton address of a token to be swapped
   * @param {Address | string} params.askJettonAddress - Jetton address of a token to be received
   * @param {bigint | number} params.offerAmount - Amount of tokens to be swapped (in basic token units)
   * @param {bigint | number} params.minAskAmount - Minimum amount of tokens received (in basic token units)
   * @param {Address | string | undefined} params.referralAddress - Optional; referral address
   * @param {bigint | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {bigint | number | string | undefined} params.forwardGasAmount - Optional; Custom transaction forward gas amount (in nanoTons)
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   * @param {Cell | undefined} params.jettonCustomPayload - Optional; custom payload for the jetton transfer message
   *
   * @returns {SenderArguments} data required to execute a jetton `swap` transaction
   */
  public async getSwapJettonToJettonTxParams(
    provider: ContractProvider,
    params: {
      userWalletAddress: AddressType;
      offerJettonAddress: AddressType;
      askJettonAddress: AddressType;
      offerAmount: AmountType;
      minAskAmount: AmountType;
      referralAddress?: AddressType;
      gasAmount?: AmountType;
      forwardGasAmount?: AmountType;
      queryId?: QueryIdType;
      jettonCustomPayload?: Cell;
    },
  ): Promise<SenderArguments> {
    const [offerJettonWalletAddress, askJettonWalletAddress] =
      await Promise.all([
        provider
          .open(JettonMinter.create(params.offerJettonAddress))
          .getWalletAddress(params.userWalletAddress),
        provider
          .open(JettonMinter.create(params.askJettonAddress))
          .getWalletAddress(this.address),
      ]);

    const forwardPayload = await this.createSwapBody({
      userWalletAddress: params.userWalletAddress,
      minAskAmount: params.minAskAmount,
      askJettonWalletAddress: askJettonWalletAddress,
      referralAddress: params.referralAddress,
    });

    const forwardTonAmount = BigInt(
      params.forwardGasAmount ??
        this.gasConstants.swapJettonToJetton.forwardGasAmount,
    );

    const body = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.offerAmount,
      destination: this.address,
      responseDestination: params.userWalletAddress,
      customPayload: params.jettonCustomPayload,
      forwardTonAmount,
      forwardPayload,
    });

    const value = BigInt(
      params.gasAmount ?? this.gasConstants.swapJettonToJetton.gasAmount,
    );

    return {
      to: offerJettonWalletAddress,
      value,
      body,
    };
  }

  public async sendSwapJettonToJetton(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<RouterV1["getSwapJettonToJettonTxParams"]>[1],
  ) {
    const txParams = await this.getSwapJettonToJettonTxParams(provider, params);

    return via.send(txParams);
  }

  /**
   * Build all data required to execute a jetton to ton `swap` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {Address | string} params.offerJettonAddress - Jetton address of a token to be swapped
   * @param {PtonV1} params.proxyTon - Proxy ton contract
   * @param {bigint | number} params.offerAmount - Amount of tokens to be swapped (in basic token units)
   * @param {bigint | number} params.minAskAmount - Minimum amount of tokens received (in basic token units)
   * @param {Address | string | undefined} params.referralAddress - Optional; referral address
   * @param {bigint | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {bigint | number | string | undefined} params.forwardGasAmount - Optional; Custom transaction forward gas amount (in nanoTons)
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   * @param {Cell | undefined} params.jettonCustomPayload - Optional; custom payload for the jetton transfer message
   *
   * @returns {SenderArguments} data required to execute a jetton `swap` transaction
   */
  public async getSwapJettonToTonTxParams(
    provider: ContractProvider,
    params: {
      userWalletAddress: AddressType;
      offerJettonAddress: AddressType;
      proxyTon: PtonV1;
      offerAmount: AmountType;
      minAskAmount: AmountType;
      referralAddress?: AddressType;
      gasAmount?: AmountType;
      forwardGasAmount?: AmountType;
      queryId?: QueryIdType;
      jettonCustomPayload?: Cell;
    },
  ): Promise<SenderArguments> {
    if (params.proxyTon.version !== RouterV1.version) {
      throw new Errors.UnmatchedPtonVersion({
        expected: RouterV1.version,
        received: params.proxyTon.version,
      });
    }

    return await this.getSwapJettonToJettonTxParams(provider, {
      ...params,
      askJettonAddress: params.proxyTon.address,
      gasAmount:
        params.gasAmount ?? this.gasConstants.swapJettonToTon.gasAmount,
      forwardGasAmount:
        params.forwardGasAmount ??
        this.gasConstants.swapJettonToTon.forwardGasAmount,
    });
  }

  public async sendSwapJettonToTon(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<RouterV1["getSwapJettonToTonTxParams"]>[1],
  ) {
    const txParams = await this.getSwapJettonToTonTxParams(provider, params);

    return via.send(txParams);
  }

  /**
   * Build all data required to execute a ton to jetton `swap` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {PtonV1} params.proxyTon - Proxy ton contract
   * @param {Address | string} params.askJettonAddress - Jetton address of a token to be received
   * @param {bigint | number} params.offerAmount - Amount of ton to be swapped (in nanoTons)
   * @param {bigint | number} params.minAskAmount - Minimum amount of tokens received (in basic token units)
   * @param {Address | string | undefined} params.referralAddress - Optional; Referral address
   * @param {bigint | number | string | undefined} params.forwardGasAmount - Optional; Custom transaction forward gas amount (in nanoTons)
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   *
   * @returns {SenderArguments} data required to execute a ton to jetton `swap` transaction
   */
  public async getSwapTonToJettonTxParams(
    provider: ContractProvider,
    params: {
      userWalletAddress: AddressType;
      proxyTon: PtonV1;
      askJettonAddress: AddressType;
      offerAmount: AmountType;
      minAskAmount: AmountType;
      referralAddress?: AddressType | undefined;
      forwardGasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    if (params.proxyTon.version !== RouterV1.version) {
      throw new Errors.UnmatchedPtonVersion({
        expected: RouterV1.version,
        received: params.proxyTon.version,
      });
    }

    const askJettonWalletAddress = await provider
      .open(JettonMinter.create(params.askJettonAddress))
      .getWalletAddress(this.address);

    const forwardPayload = await this.createSwapBody({
      userWalletAddress: params.userWalletAddress,
      minAskAmount: params.minAskAmount,
      askJettonWalletAddress: askJettonWalletAddress,
      referralAddress: params.referralAddress,
    });

    const forwardTonAmount = BigInt(
      params.forwardGasAmount ??
        this.gasConstants.swapTonToJetton.forwardGasAmount,
    );

    return await provider.open(params.proxyTon).getTonTransferTxParams({
      queryId: params.queryId ?? 0,
      tonAmount: params.offerAmount,
      destinationAddress: this.address,
      refundAddress: params.userWalletAddress,
      forwardPayload,
      forwardTonAmount,
    });
  }

  public async sendSwapTonToJetton(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<RouterV1["getSwapTonToJettonTxParams"]>[1],
  ) {
    const txParams = await this.getSwapTonToJettonTxParams(provider, params);

    return via.send(txParams);
  }

  public async createProvideLiquidityBody(params: {
    routerWalletAddress: AddressType;
    minLpOut: AmountType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(DEX_OP_CODES.PROVIDE_LP, 32)
      .storeAddress(toAddress(params.routerWalletAddress))
      .storeCoins(BigInt(params.minLpOut))
      .endCell();
  }

  /**
   * Collect all data required to execute a jetton `provide_lp` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {Address | string} params.sendTokenAddress - Address of the provided Jetton token
   * @param {Address | string} params.otherTokenAddress - Address of the other Jetton token in pair
   * @param {bigint | number} params.sendAmount - Amount of the first token deposited as liquidity (in basic token units)
   * @param {bigint | number} params.minLpOut - Minimum amount of created liquidity tokens (in basic token units)
   * @param {bigint | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {bigint | number | string | undefined} params.forwardGasAmount - Optional; Custom transaction forward gas amount (in nanoTons)
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   * @param {Cell | undefined} params.jettonCustomPayload - Optional; custom payload for the jetton transfer message
   *
   * @returns {SenderArguments} data required to execute a jetton `provide_lp` transaction
   */
  public async getProvideLiquidityJettonTxParams(
    provider: ContractProvider,
    params: {
      userWalletAddress: AddressType;
      sendTokenAddress: AddressType;
      otherTokenAddress: AddressType;
      sendAmount: AmountType;
      minLpOut: AmountType;
      gasAmount?: AmountType;
      forwardGasAmount?: AmountType;
      queryId?: QueryIdType;
      jettonCustomPayload?: Cell;
    },
  ): Promise<SenderArguments> {
    const [jettonWalletAddress, routerWalletAddress] = await Promise.all([
      provider
        .open(JettonMinter.create(params.sendTokenAddress))
        .getWalletAddress(params.userWalletAddress),
      provider
        .open(JettonMinter.create(params.otherTokenAddress))
        .getWalletAddress(this.address),
    ]);

    const forwardPayload = await this.createProvideLiquidityBody({
      routerWalletAddress: routerWalletAddress,
      minLpOut: params.minLpOut,
    });

    const forwardTonAmount = BigInt(
      params.forwardGasAmount ??
        this.gasConstants.provideLpJetton.forwardGasAmount,
    );

    const body = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.sendAmount,
      destination: this.address,
      responseDestination: params.userWalletAddress,
      customPayload: params.jettonCustomPayload,
      forwardTonAmount,
      forwardPayload,
    });

    const value = BigInt(
      params.gasAmount ?? this.gasConstants.provideLpJetton.gasAmount,
    );

    return {
      to: jettonWalletAddress,
      value,
      body,
    };
  }

  public async sendProvideLiquidityJetton(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<RouterV1["getProvideLiquidityJettonTxParams"]>[1],
  ) {
    const txParams = await this.getProvideLiquidityJettonTxParams(
      provider,
      params,
    );

    return via.send(txParams);
  }

  /**
   * Collect all data required to execute a proxy ton `provide_lp` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {PtonV1} params.proxyTon - proxy ton contract
   * @param {Address | string} params.otherTokenAddress - Address of the other Jetton token in pair
   * @param {bigint | number} params.sendAmount - Amount of ton deposited as liquidity (in nanoTons)
   * @param {bigint | number} params.minLpOut - Minimum amount of created liquidity tokens (in basic token units)
   * @param {bigint | number | string | undefined} params.forwardGasAmount - Optional; Custom transaction forward gas amount (in nanoTons)
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   *
   * @returns {SenderArguments} data required to execute a proxy ton `provide_lp` transaction
   */
  public async getProvideLiquidityTonTxParams(
    provider: ContractProvider,
    params: {
      userWalletAddress: AddressType;
      proxyTon: PtonV1;
      otherTokenAddress: AddressType;
      sendAmount: AmountType;
      minLpOut: AmountType;
      forwardGasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    if (params.proxyTon.version !== RouterV1.version) {
      throw new Errors.UnmatchedPtonVersion({
        expected: RouterV1.version,
        received: params.proxyTon.version,
      });
    }

    const routerWalletAddress = await provider
      .open(JettonMinter.create(params.otherTokenAddress))
      .getWalletAddress(this.address);

    const forwardPayload = await this.createProvideLiquidityBody({
      routerWalletAddress: routerWalletAddress,
      minLpOut: params.minLpOut,
    });

    const forwardTonAmount = BigInt(
      params.forwardGasAmount ??
        this.gasConstants.provideLpTon.forwardGasAmount,
    );

    return await provider.open(params.proxyTon).getTonTransferTxParams({
      queryId: params.queryId ?? 0,
      tonAmount: params.sendAmount,
      destinationAddress: this.address,
      refundAddress: params.userWalletAddress,
      forwardPayload,
      forwardTonAmount,
    });
  }

  public async sendProvideLiquidityTon(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<RouterV1["getProvideLiquidityTonTxParams"]>[1],
  ) {
    const txParams = await this.getProvideLiquidityTonTxParams(
      provider,
      params,
    );

    return via.send(txParams);
  }

  /**
   * **Note:** It's necessary to specify addresses of Jetton wallets of the router as the arguments of this method.
   * These addresses can be retrieved with getJettonWalletAddress of the Jetton minter.
   *
   * @param {Address | string} params.token0 - The address of the router's wallet of first Jetton
   * @param {Address | string} params.token1 - The address of the router's wallet of second Jetton
   *
   * @returns {Address} an address of a pool for a specified pair of assets.
   */
  public async getPoolAddress(
    provider: ContractProvider,
    params: {
      token0: AddressType;
      token1: AddressType;
    },
  ) {
    const result = await provider.get("get_pool_address", [
      {
        type: "slice",
        cell: beginCell().storeAddress(toAddress(params.token0)).endCell(),
      },
      {
        type: "slice",
        cell: beginCell().storeAddress(toAddress(params.token1)).endCell(),
      },
    ]);

    return result.stack.readAddress();
  }

  /**
   * @param {Address | string} params.token0 - The address of the first Jetton minter
   * @param {Address | string} params.token1 - The address of the second Jetton minter
   *
   * @returns {Address} an address of a pool for a specified pair of assets.
   */
  public async getPoolAddressByJettonMinters(
    provider: ContractProvider,
    params: {
      token0: AddressType;
      token1: AddressType;
    },
  ) {
    const [jetton0WalletAddress, jetton1WalletAddress] = await Promise.all([
      provider
        .open(JettonMinter.create(params.token0))
        .getWalletAddress(this.address),
      provider
        .open(JettonMinter.create(params.token1))
        .getWalletAddress(this.address),
    ]);

    const poolAddress = await this.getPoolAddress(provider, {
      token0: jetton0WalletAddress,
      token1: jetton1WalletAddress,
    });

    return poolAddress;
  }

  /**
   * @param {Address | string} params.token0 - The address of the first Jetton minter
   * @param {Address | string} params.token1 - The address of the second Jetton minter
   *
   * @returns {PoolV1} object for a pool with specified Jetton token addresses.
   */
  public async getPool(
    provider: ContractProvider,
    params: {
      token0: AddressType;
      token1: AddressType;
    },
  ) {
    const poolAddress = await this.getPoolAddressByJettonMinters(provider, {
      token0: params.token0,
      token1: params.token1,
    });

    return PoolV1.create(poolAddress);
  }

  /**
   * @returns current state of the router.
   */
  public async getRouterData(provider: ContractProvider) {
    const result = await provider.get("get_router_data", []);

    return {
      isLocked: result.stack.readBoolean(),
      adminAddress: result.stack.readAddress(),
      tempUpgrade: result.stack.readCell(),
      poolCode: result.stack.readCell(),
      jettonLpWalletCode: result.stack.readCell(),
      lpAccountCode: result.stack.readCell(),
    };
  }
}
