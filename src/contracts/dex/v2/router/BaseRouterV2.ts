import {
  type Cell,
  type ContractProvider,
  type Sender,
  type SenderArguments,
  beginCell,
  toNano,
} from "@ton/ton";

import type { AddressType, AmountType, QueryIdType } from "@/types";
import { Contract, type ContractOptions } from "@/contracts/core/Contract";
import {
  DEX_VERSION,
  DEX_OP_CODES,
  type DEX_TYPE,
} from "@/contracts/dex/constants";
import { JettonMinter } from "@/contracts/core/JettonMinter";
import type { Pton } from "@/contracts/pTON/types";
import { createJettonTransferMessage } from "@/utils/createJettonTransferMessage";
import { toAddress } from "@/utils/toAddress";

import { BasePoolV2 } from "../pool/BasePoolV2";
import { VaultV2 } from "../vault/VaultV2";

export interface BaseRouterV2Options extends ContractOptions {
  gasConstants?: Partial<typeof BaseRouterV2.gasConstants>;
}

export class BaseRouterV2 extends Contract {
  public static readonly version = DEX_VERSION.v2;

  public static readonly gasConstants = {
    swapJettonToJetton: {
      gasAmount: toNano("0.3"),
      forwardGasAmount: toNano("0.24"),
    },
    swapJettonToTon: {
      gasAmount: toNano("0.3"),
      forwardGasAmount: toNano("0.24"),
    },
    swapTonToJetton: {
      forwardGasAmount: toNano("0.3"),
    },
    provideLpJetton: {
      gasAmount: toNano("0.3"),
      forwardGasAmount: toNano("0.235"),
    },
    provideLpTon: {
      forwardGasAmount: toNano("0.3"),
    },
    singleSideProvideLpJetton: {
      gasAmount: toNano("1"),
      forwardGasAmount: toNano("0.8"),
    },
    singleSideProvideLpTon: {
      forwardGasAmount: toNano("0.8"),
    },
  };

  public readonly gasConstants;

  constructor(
    address: AddressType,
    { gasConstants, ...options }: BaseRouterV2Options = {},
  ) {
    super(address, options);

    this.gasConstants = {
      ...BaseRouterV2.gasConstants,
      ...gasConstants,
    };
  }

  public async createSwapBody(params: {
    askJettonWalletAddress: AddressType;
    receiverAddress: AddressType;
    minAskAmount: AmountType;
    refundAddress: AddressType;
    excessesAddress?: AddressType;
    customPayload?: Cell;
    customPayloadForwardGasAmount?: AmountType;
    refundPayload?: Cell;
    refundForwardGasAmount?: AmountType;
    referralAddress?: AddressType;
    referralValue?: AmountType;
  }): Promise<Cell> {
    if (
      params.referralValue &&
      (BigInt(params.referralValue) < 0 || BigInt(params.referralValue) > 100)
    ) {
      throw Error(`'referralValue' should be in range (0, 100)`);
    }

    return beginCell()
      .storeUint(DEX_OP_CODES.SWAP, 32)
      .storeAddress(toAddress(params.askJettonWalletAddress))
      .storeAddress(toAddress(params.refundAddress))
      .storeAddress(toAddress(params.excessesAddress ?? params.refundAddress))
      .storeRef(
        beginCell()
          .storeCoins(BigInt(params.minAskAmount))
          .storeAddress(toAddress(params.receiverAddress))
          .storeCoins(BigInt(params.customPayloadForwardGasAmount ?? 0))
          .storeMaybeRef(params.customPayload)
          .storeCoins(BigInt(params.refundForwardGasAmount ?? 0))
          .storeMaybeRef(params.refundPayload)
          .storeUint(BigInt(params.referralValue ?? 10), 16)
          .storeAddress(
            params.referralAddress ? toAddress(params.referralAddress) : null,
          )
          .endCell(),
      )
      .endCell();
  }

  public async createCrossSwapBody(params: {
    askJettonWalletAddress: AddressType;
    receiverAddress: AddressType;
    minAskAmount: AmountType;
    refundAddress: AddressType;
    excessesAddress?: AddressType;
    customPayload?: Cell;
    customPayloadForwardGasAmount?: AmountType;
    refundPayload?: Cell;
    refundForwardGasAmount?: AmountType;
    referralAddress?: AddressType;
    referralValue?: AmountType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(DEX_OP_CODES.CROSS_SWAP, 32)
      .storeAddress(toAddress(params.askJettonWalletAddress))
      .storeAddress(toAddress(params.refundAddress))
      .storeAddress(toAddress(params.excessesAddress ?? params.refundAddress))
      .storeRef(
        beginCell()
          .storeCoins(BigInt(params.minAskAmount))
          .storeAddress(toAddress(params.receiverAddress))
          .storeCoins(BigInt(params.customPayloadForwardGasAmount ?? 0))
          .storeMaybeRef(params.customPayload)
          .storeCoins(BigInt(params.refundForwardGasAmount ?? 0))
          .storeMaybeRef(params.refundPayload)
          .storeUint(BigInt(params.referralValue ?? 10), 16)
          .storeAddress(
            params.referralAddress ? toAddress(params.referralAddress) : null,
          )
          .endCell(),
      )
      .endCell();
  }

  public async getSwapJettonToJettonTxParams(
    provider: ContractProvider,
    params: {
      userWalletAddress: AddressType;
      offerJettonAddress: AddressType;
      askJettonAddress: AddressType;
      offerAmount: AmountType;
      minAskAmount: AmountType;
      refundAddress?: AddressType;
      excessesAddress?: AddressType;
      referralAddress?: AddressType;
      referralValue?: AmountType;
      customPayload?: Cell;
      customPayloadForwardGasAmount?: AmountType;
      refundPayload?: Cell;
      refundForwardGasAmount?: AmountType;
      gasAmount?: AmountType;
      forwardGasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const contractAddress = this.address;

    const [offerJettonWalletAddress, askJettonWalletAddress] =
      await Promise.all([
        provider
          .open(JettonMinter.create(params.offerJettonAddress))
          .getWalletAddress(params.userWalletAddress),
        provider
          .open(JettonMinter.create(params.askJettonAddress))
          .getWalletAddress(contractAddress),
      ]);

    const forwardTonAmount = BigInt(
      params.forwardGasAmount ??
        this.gasConstants.swapJettonToJetton.forwardGasAmount,
    );

    const forwardPayload = await this.createSwapBody({
      askJettonWalletAddress: askJettonWalletAddress,
      receiverAddress: params.userWalletAddress,
      minAskAmount: params.minAskAmount,
      refundAddress: params.refundAddress ?? params.userWalletAddress,
      excessesAddress: params.excessesAddress,
      referralAddress: params.referralAddress,
      referralValue: params.referralValue,
      customPayload: params.customPayload,
      customPayloadForwardGasAmount: params.customPayloadForwardGasAmount,
      refundPayload: params.refundPayload,
      refundForwardGasAmount: params.refundForwardGasAmount,
    });

    const body = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.offerAmount,
      destination: contractAddress,
      responseDestination: params.userWalletAddress,
      forwardPayload,
      forwardTonAmount,
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
    params: Parameters<BaseRouterV2["getSwapJettonToJettonTxParams"]>[1],
  ) {
    const txParams = await this.getSwapJettonToJettonTxParams(provider, params);

    return via.send(txParams);
  }

  public async getSwapJettonToTonTxParams(
    provider: ContractProvider,
    params: {
      userWalletAddress: AddressType;
      offerJettonAddress: AddressType;
      proxyTon: Pton;
      offerAmount: AmountType;
      minAskAmount: AmountType;
      refundAddress?: AddressType;
      excessesAddress?: AddressType;
      referralAddress?: AddressType;
      referralValue?: AmountType;
      customPayload?: Cell;
      customPayloadForwardGasAmount?: AmountType;
      refundPayload?: Cell;
      refundForwardGasAmount?: AmountType;
      gasAmount?: AmountType;
      forwardGasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
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
    params: Parameters<BaseRouterV2["getSwapJettonToTonTxParams"]>[1],
  ) {
    const txParams = await this.getSwapJettonToTonTxParams(provider, params);

    return via.send(txParams);
  }

  public async getSwapTonToJettonTxParams(
    provider: ContractProvider,
    params: {
      userWalletAddress: AddressType;
      proxyTon: Pton;
      askJettonAddress: AddressType;
      offerAmount: AmountType;
      minAskAmount: AmountType;
      refundAddress?: AddressType;
      excessesAddress?: AddressType;
      referralAddress?: AddressType;
      referralValue?: AmountType;
      customPayload?: Cell;
      customPayloadForwardGasAmount?: AmountType;
      refundPayload?: Cell;
      refundForwardGasAmount?: AmountType;
      forwardGasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const contractAddress = this.address;

    const askJettonWalletAddress = await provider
      .open(JettonMinter.create(params.askJettonAddress))
      .getWalletAddress(contractAddress);

    const forwardPayload = await this.createSwapBody({
      askJettonWalletAddress: askJettonWalletAddress,
      receiverAddress: params.userWalletAddress,
      minAskAmount: params.minAskAmount,
      refundAddress: params.refundAddress ?? params.userWalletAddress,
      excessesAddress: params.excessesAddress,
      referralAddress: params.referralAddress,
      referralValue: params.referralValue,
      customPayload: params.customPayload,
      customPayloadForwardGasAmount: params.customPayloadForwardGasAmount,
      refundPayload: params.refundPayload,
      refundForwardGasAmount: params.refundForwardGasAmount,
    });

    const forwardTonAmount = BigInt(
      params.forwardGasAmount ??
        this.gasConstants.swapTonToJetton.forwardGasAmount,
    );

    return await provider.open(params.proxyTon).getTonTransferTxParams({
      queryId: params.queryId ?? 0,
      tonAmount: params.offerAmount,
      destinationAddress: contractAddress,
      refundAddress: params.userWalletAddress,
      forwardPayload,
      forwardTonAmount,
    });
  }

  public async sendSwapTonToJetton(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<BaseRouterV2["getSwapTonToJettonTxParams"]>[1],
  ) {
    const txParams = await this.getSwapTonToJettonTxParams(provider, params);

    return via.send(txParams);
  }

  public async createProvideLiquidityBody(params: {
    routerWalletAddress: AddressType;
    minLpOut: AmountType;
    receiverAddress: AddressType;
    refundAddress: AddressType;
    excessesAddress?: AddressType;
    bothPositive: boolean;
    customPayload?: Cell;
    customPayloadForwardGasAmount?: AmountType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(DEX_OP_CODES.PROVIDE_LP, 32)
      .storeAddress(toAddress(params.routerWalletAddress))
      .storeAddress(toAddress(params.refundAddress))
      .storeAddress(toAddress(params.excessesAddress ?? params.refundAddress))
      .storeRef(
        beginCell()
          .storeCoins(BigInt(params.minLpOut))
          .storeAddress(toAddress(params.receiverAddress))
          .storeUint(params.bothPositive ? 1 : 0, 1)
          .storeCoins(BigInt(params.customPayloadForwardGasAmount ?? 0))
          .storeMaybeRef(params.customPayload)
          .endCell(),
      )
      .endCell();
  }

  public async createCrossProvideLiquidityBody(params: {
    routerWalletAddress: AddressType;
    minLpOut: AmountType;
    receiverAddress: AddressType;
    refundAddress: AddressType;
    excessesAddress?: AddressType;
    bothPositive: boolean;
    customPayload?: Cell;
    customPayloadForwardGasAmount?: AmountType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(DEX_OP_CODES.CROSS_PROVIDE_LP, 32)
      .storeAddress(toAddress(params.routerWalletAddress))
      .storeAddress(toAddress(params.refundAddress))
      .storeAddress(toAddress(params.excessesAddress ?? params.refundAddress))
      .storeRef(
        beginCell()
          .storeCoins(BigInt(params.minLpOut))
          .storeAddress(toAddress(params.receiverAddress))
          .storeUint(params.bothPositive ? 1 : 0, 1)
          .storeCoins(BigInt(params.customPayloadForwardGasAmount ?? 0))
          .storeMaybeRef(params.customPayload)
          .endCell(),
      )
      .endCell();
  }

  public async getProvideLiquidityJettonTxParams(
    provider: ContractProvider,
    params: {
      userWalletAddress: AddressType;
      sendTokenAddress: AddressType;
      otherTokenAddress: AddressType;
      sendAmount: AmountType;
      minLpOut: AmountType;
      refundAddress?: AddressType;
      excessesAddress?: AddressType;
      customPayload?: Cell;
      customPayloadForwardGasAmount?: AmountType;
      gasAmount?: AmountType;
      forwardGasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    return this.implGetProvideLiquidityJettonTxParams(provider, {
      ...params,
      gasAmount:
        params.gasAmount ?? this.gasConstants.provideLpJetton.gasAmount,
      forwardGasAmount:
        params.forwardGasAmount ??
        this.gasConstants.provideLpJetton.forwardGasAmount,
      bothPositive: true,
    });
  }

  public async sendProvideLiquidityJetton(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<BaseRouterV2["getProvideLiquidityJettonTxParams"]>[1],
  ) {
    const txParams = await this.getProvideLiquidityJettonTxParams(
      provider,
      params,
    );

    return via.send(txParams);
  }

  public async getSingleSideProvideLiquidityJettonTxParams(
    provider: ContractProvider,
    params: {
      userWalletAddress: AddressType;
      sendTokenAddress: AddressType;
      otherTokenAddress: AddressType;
      sendAmount: AmountType;
      minLpOut: AmountType;
      refundAddress?: AddressType;
      excessesAddress?: AddressType;
      customPayload?: Cell;
      customPayloadForwardGasAmount?: AmountType;
      gasAmount?: AmountType;
      forwardGasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    return this.implGetProvideLiquidityJettonTxParams(provider, {
      ...params,
      gasAmount:
        params.gasAmount ??
        this.gasConstants.singleSideProvideLpJetton.gasAmount,
      forwardGasAmount:
        params.forwardGasAmount ??
        this.gasConstants.singleSideProvideLpJetton.forwardGasAmount,
      bothPositive: false,
    });
  }

  public async sendSingleSideProvideLiquidityJetton(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<
      BaseRouterV2["getSingleSideProvideLiquidityJettonTxParams"]
    >[1],
  ) {
    const txParams = await this.getSingleSideProvideLiquidityJettonTxParams(
      provider,
      params,
    );

    return via.send(txParams);
  }

  protected async implGetProvideLiquidityJettonTxParams(
    provider: ContractProvider,
    params: Parameters<BaseRouterV2["getProvideLiquidityJettonTxParams"]>[1] & {
      gasAmount: AmountType;
      forwardGasAmount: AmountType;
      bothPositive: boolean;
    },
  ) {
    const contractAddress = this.address;

    const [jettonWalletAddress, routerWalletAddress] = await Promise.all([
      provider
        .open(JettonMinter.create(params.sendTokenAddress))
        .getWalletAddress(params.userWalletAddress),
      provider
        .open(JettonMinter.create(params.otherTokenAddress))
        .getWalletAddress(contractAddress),
    ]);

    const forwardPayload = await this.createProvideLiquidityBody({
      routerWalletAddress: routerWalletAddress,
      receiverAddress: params.userWalletAddress,
      minLpOut: params.minLpOut,
      refundAddress: params.refundAddress ?? params.userWalletAddress,
      excessesAddress: params.excessesAddress,
      customPayload: params.customPayload,
      customPayloadForwardGasAmount: params.customPayloadForwardGasAmount,
      bothPositive: params.bothPositive,
    });

    const forwardTonAmount = BigInt(params.forwardGasAmount);

    const body = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.sendAmount,
      destination: contractAddress,
      responseDestination: params.userWalletAddress,
      forwardTonAmount,
      forwardPayload,
    });

    const value = BigInt(params.gasAmount);

    return {
      to: jettonWalletAddress,
      value,
      body,
    };
  }

  public async getProvideLiquidityTonTxParams(
    provider: ContractProvider,
    params: {
      userWalletAddress: AddressType;
      proxyTon: Pton;
      otherTokenAddress: AddressType;
      sendAmount: AmountType;
      minLpOut: AmountType;
      refundAddress?: AddressType;
      excessesAddress?: AddressType;
      bothPositive?: boolean;
      customPayload?: Cell;
      customPayloadForwardGasAmount?: AmountType;
      forwardGasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    return this.implGetProvideLiquidityTonTxParams(provider, {
      ...params,
      forwardGasAmount:
        params.forwardGasAmount ??
        this.gasConstants.provideLpTon.forwardGasAmount,
      bothPositive: true,
    });
  }

  public async sendProvideLiquidityTon(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<BaseRouterV2["getProvideLiquidityTonTxParams"]>[1],
  ) {
    const txParams = await this.getProvideLiquidityTonTxParams(
      provider,
      params,
    );

    return via.send(txParams);
  }

  public async getSingleSideProvideLiquidityTonTxParams(
    provider: ContractProvider,
    params: {
      userWalletAddress: AddressType;
      proxyTon: Pton;
      otherTokenAddress: AddressType;
      sendAmount: AmountType;
      minLpOut: AmountType;
      refundAddress?: AddressType;
      excessesAddress?: AddressType;
      bothPositive?: boolean;
      customPayload?: Cell;
      customPayloadForwardGasAmount?: AmountType;
      forwardGasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    return this.implGetProvideLiquidityTonTxParams(provider, {
      ...params,
      forwardGasAmount:
        params.forwardGasAmount ??
        this.gasConstants.singleSideProvideLpTon.forwardGasAmount,
      bothPositive: false,
    });
  }

  public async sendSingleSideProvideLiquidityTon(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<
      BaseRouterV2["getSingleSideProvideLiquidityTonTxParams"]
    >[1],
  ) {
    const txParams = await this.getSingleSideProvideLiquidityTonTxParams(
      provider,
      params,
    );

    return via.send(txParams);
  }

  protected async implGetProvideLiquidityTonTxParams(
    provider: ContractProvider,
    params: Parameters<BaseRouterV2["getProvideLiquidityTonTxParams"]>[1] & {
      forwardGasAmount: AmountType;
      bothPositive: boolean;
    },
  ) {
    const contractAddress = this.address;

    const routerWalletAddress = await provider
      .open(JettonMinter.create(params.otherTokenAddress))
      .getWalletAddress(contractAddress);

    const forwardPayload = await this.createProvideLiquidityBody({
      routerWalletAddress: routerWalletAddress,
      receiverAddress: params.userWalletAddress,
      minLpOut: params.minLpOut,
      refundAddress: params.refundAddress ?? params.userWalletAddress,
      excessesAddress: params.excessesAddress,
      customPayload: params.customPayload,
      customPayloadForwardGasAmount: params.customPayloadForwardGasAmount,
      bothPositive: params.bothPositive,
    });

    const forwardTonAmount = BigInt(params.forwardGasAmount);

    return await provider.open(params.proxyTon).getTonTransferTxParams({
      queryId: params.queryId ?? 0,
      tonAmount: params.sendAmount,
      destinationAddress: contractAddress,
      refundAddress: params.userWalletAddress,
      forwardPayload,
      forwardTonAmount,
    });
  }

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

  public async getPool(
    provider: ContractProvider,
    params: {
      token0: AddressType;
      token1: AddressType;
    },
  ) {
    const poolAddress = await this.getPoolAddressByJettonMinters(
      provider,
      params,
    );

    return BasePoolV2.create(poolAddress);
  }

  public async getVaultAddress(
    provider: ContractProvider,
    params: {
      user: AddressType;
      tokenWallet: AddressType;
    },
  ) {
    const result = await provider.get("get_vault_address", [
      {
        type: "slice",
        cell: beginCell().storeAddress(toAddress(params.user)).endCell(),
      },
      {
        type: "slice",
        cell: beginCell().storeAddress(toAddress(params.tokenWallet)).endCell(),
      },
    ]);

    return result.stack.readAddress();
  }

  public async getVault(
    provider: ContractProvider,
    params: {
      user: AddressType;
      tokenMinter: AddressType;
    },
  ) {
    const tokenMinter = provider.open(JettonMinter.create(params.tokenMinter));

    const vaultAddress = await this.getVaultAddress(provider, {
      user: params.user,
      tokenWallet: await tokenMinter.getWalletAddress(this.address),
    });

    return VaultV2.create(vaultAddress);
  }

  public async getRouterVersion(provider: ContractProvider) {
    const result = await provider.get("get_router_version", []);

    return {
      major: result.stack.readNumber(),
      minor: result.stack.readNumber(),
      development: result.stack.readString(),
    };
  }

  public async getRouterData(provider: ContractProvider) {
    const result = await provider.get("get_router_data", []);

    return {
      routerId: result.stack.readNumber(),
      dexType: result.stack.readString() as DEX_TYPE,
      isLocked: result.stack.readBoolean(),
      adminAddress: result.stack.readAddress(),
      tempUpgrade: result.stack.readCell(),
      poolCode: result.stack.readCell(),
      jettonLpWalletCode: result.stack.readCell(),
      lpAccountCode: result.stack.readCell(),
      vaultCode: result.stack.readCell(),
    };
  }
}
