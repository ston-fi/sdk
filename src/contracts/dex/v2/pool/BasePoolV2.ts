import {
  type Cell,
  type ContractProvider,
  type Sender,
  type SenderArguments,
  beginCell,
  toNano,
} from "@ton/ton";

import type { AddressType, AmountType, QueryIdType } from "@/types";
import type { ContractOptions } from "@/contracts/core/Contract";
import { JettonMinter } from "@/contracts/core/JettonMinter";
import { JettonWallet } from "@/contracts/core/JettonWallet";
import {
  DEX_VERSION,
  DEX_OP_CODES,
  type DEX_TYPE,
} from "@/contracts/dex/constants";
import { toAddress } from "@/utils/toAddress";

import { LpAccountV2 } from "../LpAccount/LpAccountV2";

export interface BasePoolV2Options extends ContractOptions {
  gasConstants?: Partial<typeof BasePoolV2.gasConstants>;
}

export class BasePoolV2 extends JettonMinter {
  public static readonly version = DEX_VERSION.v2;

  public static readonly gasConstants = {
    collectFees: toNano("0.4"),
    burn: toNano("0.8"),
  };

  public readonly gasConstants;

  constructor(
    address: AddressType,
    { gasConstants, ...options }: BasePoolV2Options = {},
  ) {
    super(address, options);

    this.gasConstants = {
      ...BasePoolV2.gasConstants,
      ...gasConstants,
    };
  }

  public async createCollectFeesBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(DEX_OP_CODES.COLLECT_FEES, 32)
      .storeUint(params?.queryId ?? 0, 64)
      .endCell();
  }

  public async getCollectFeeTxParams(
    provider: ContractProvider,
    params?: {
      gasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = this.address;

    const body = await this.createCollectFeesBody({
      queryId: params?.queryId,
    });

    const value = BigInt(params?.gasAmount ?? this.gasConstants.collectFees);

    return { to, value, body };
  }

  public async sendCollectFees(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<BasePoolV2["getCollectFeeTxParams"]>[1],
  ) {
    const txParams = await this.getCollectFeeTxParams(provider, params);

    return via.send(txParams);
  }

  public async createBurnBody(params: {
    amount: AmountType;
    customPayload?: Cell;
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(DEX_OP_CODES.BURN, 32)
      .storeUint(params?.queryId ?? 0, 64)
      .storeCoins(BigInt(params.amount))
      .storeAddress(null)
      .storeMaybeRef(params.customPayload)
      .endCell();
  }

  public async getBurnTxParams(
    provider: ContractProvider,
    params: {
      amount: AmountType;
      userWalletAddress: AddressType;
      customPayload?: Cell;
      gasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const [to, body] = await Promise.all([
      this.getWalletAddress(provider, params.userWalletAddress),
      this.createBurnBody({
        amount: params.amount,
        customPayload: params.customPayload,
        queryId: params.queryId,
      }),
    ]);

    const value = BigInt(params.gasAmount ?? this.gasConstants.burn);

    return { to, value, body };
  }

  public async sendBurn(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<BasePoolV2["getBurnTxParams"]>[1],
  ) {
    const txParams = await this.getBurnTxParams(provider, params);

    return via.send(txParams);
  }

  public async getPoolType(provider: ContractProvider) {
    const result = await provider.get("get_pool_type", []);

    return result.stack.readString() as DEX_TYPE;
  }

  public async getLpAccountAddress(
    provider: ContractProvider,
    params: {
      ownerAddress: AddressType;
    },
  ) {
    const result = await provider.get("get_lp_account_address", [
      {
        type: "slice",
        cell: beginCell()
          .storeAddress(toAddress(params.ownerAddress))
          .endCell(),
      },
    ]);

    return result.stack.readAddress();
  }

  public async getLpAccount(
    provider: ContractProvider,
    params: {
      ownerAddress: AddressType;
    },
  ) {
    const lpAccountAddress = await this.getLpAccountAddress(provider, params);

    return LpAccountV2.create(lpAccountAddress);
  }

  public async getJettonWallet(
    provider: ContractProvider,
    params: {
      ownerAddress: AddressType;
    },
  ) {
    const jettonWalletAddress = await this.getWalletAddress(
      provider,
      params.ownerAddress,
    );

    return JettonWallet.create(jettonWalletAddress);
  }

  public async getPoolData(provider: ContractProvider) {
    const data = await this.implGetPoolData(provider);

    return data.commonPoolData;
  }

  protected async implGetPoolData(provider: ContractProvider) {
    const result = await provider.get("get_pool_data", []);

    return {
      commonPoolData: {
        isLocked: result.stack.readBoolean(),
        routerAddress: result.stack.readAddress(),
        totalSupplyLP: result.stack.readBigNumber(),
        reserve0: result.stack.readBigNumber(),
        reserve1: result.stack.readBigNumber(),
        token0WalletAddress: result.stack.readAddress(),
        token1WalletAddress: result.stack.readAddress(),
        lpFee: result.stack.readBigNumber(),
        protocolFee: result.stack.readBigNumber(),
        protocolFeeAddress: result.stack.readAddressOpt(),
        collectedToken0ProtocolFee: result.stack.readBigNumber(),
        collectedToken1ProtocolFee: result.stack.readBigNumber(),
      },
      stack: result.stack,
    };
  }
}
