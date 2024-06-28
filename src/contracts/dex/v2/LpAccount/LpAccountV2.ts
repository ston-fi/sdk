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
import { DEX_VERSION, DEX_OP_CODES } from "@/contracts/dex/constants";
import { toAddress } from "@/utils/toAddress";

export interface LpAccountV2Options extends ContractOptions {
  gasConstants?: Partial<typeof LpAccountV2.gasConstants>;
}

export class LpAccountV2 extends Contract {
  public static readonly version = DEX_VERSION.v2;

  public static readonly gasConstants = {
    refund: toNano("0.8"),
    directAddLp: toNano("0.3"),
    resetGas: toNano("0.02"),
  };

  public readonly gasConstants;

  constructor(
    address: AddressType,
    { gasConstants, ...options }: LpAccountV2Options = {},
  ) {
    super(address, options);

    this.gasConstants = {
      ...LpAccountV2.gasConstants,
      ...gasConstants,
    };
  }

  public async createRefundBody(params?: {
    leftMaybePayload?: Cell;
    rightMaybePayload?: Cell;
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(DEX_OP_CODES.REFUND_ME, 32)
      .storeUint(params?.queryId ?? 0, 64)
      .storeMaybeRef(params?.leftMaybePayload)
      .storeMaybeRef(params?.rightMaybePayload)
      .endCell();
  }

  public async getRefundTxParams(
    provider: ContractProvider,
    params?: {
      leftMaybePayload?: Cell;
      rightMaybePayload?: Cell;
      gasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = this.address;

    const body = await this.createRefundBody({
      leftMaybePayload: params?.leftMaybePayload,
      rightMaybePayload: params?.rightMaybePayload,
      queryId: params?.queryId,
    });

    const value = BigInt(params?.gasAmount ?? this.gasConstants.refund);

    return { to, value, body };
  }

  public async sendRefund(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<LpAccountV2["getRefundTxParams"]>[1],
  ) {
    const txParams = await this.getRefundTxParams(provider, params);

    return via.send(txParams);
  }

  public async createDirectAddLiquidityBody(params: {
    amount0: AmountType;
    amount1: AmountType;
    minimumLpToMint?: AmountType;
    userWalletAddress: AddressType;
    refundAddress?: AddressType;
    excessesAddress?: AddressType;
    customPayload?: Cell;
    customPayloadForwardGasAmount?: AmountType;
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(DEX_OP_CODES.DIRECT_ADD_LIQUIDITY, 32)
      .storeUint(params?.queryId ?? 0, 64)
      .storeCoins(BigInt(params.amount0))
      .storeCoins(BigInt(params.amount1))
      .storeCoins(BigInt(params.minimumLpToMint ?? 1))
      .storeCoins(BigInt(params.customPayloadForwardGasAmount ?? 0))
      .storeAddress(toAddress(params.userWalletAddress))
      .storeMaybeRef(params.customPayload)
      .storeRef(
        beginCell()
          .storeAddress(
            toAddress(params.refundAddress ?? params.userWalletAddress),
          )
          .storeAddress(
            toAddress(
              params.excessesAddress ??
                params.refundAddress ??
                params.userWalletAddress,
            ),
          )
          .endCell(),
      )
      .endCell();
  }

  public async getDirectAddLiquidityTxParams(
    provider: ContractProvider,
    params: {
      userWalletAddress: AddressType;
      amount0: AmountType;
      amount1: AmountType;
      minimumLpToMint?: AmountType;
      refundAddress?: AddressType;
      excessesAddress?: AddressType;
      customPayload?: Cell;
      customPayloadForwardGasAmount?: AmountType;
      gasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = this.address;

    const body = await this.createDirectAddLiquidityBody({
      amount0: params.amount0,
      amount1: params.amount1,
      minimumLpToMint: params.minimumLpToMint,
      userWalletAddress: params.userWalletAddress,
      refundAddress: params.refundAddress,
      excessesAddress: params.excessesAddress,
      customPayload: params.customPayload,
      customPayloadForwardGasAmount: params.customPayloadForwardGasAmount,
      queryId: params.queryId,
    });

    const value = BigInt(params.gasAmount ?? this.gasConstants.directAddLp);

    return { to, value, body };
  }

  public async sendDirectAddLiquidity(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<LpAccountV2["getDirectAddLiquidityTxParams"]>[1],
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
    params: Parameters<LpAccountV2["getResetGasTxParams"]>[1],
  ) {
    const txParams = await this.getResetGasTxParams(provider, params);

    return via.send(txParams);
  }

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
