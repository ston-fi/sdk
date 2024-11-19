import {
  type Cell,
  type ContractProvider,
  type Sender,
  type SenderArguments,
  beginCell,
  toNano,
} from "@ton/ton";

import type { AddressType, AmountType, QueryIdType } from "../../../../types";
import { toAddress } from "../../../../utils/toAddress";
import type { ContractOptions } from "../../../core/Contract";
import { JettonMinter } from "../../../core/JettonMinter";
import { JettonWallet } from "../../../core/JettonWallet";
import { type DEX_TYPE, DEX_VERSION } from "../../constants";
import { LpAccountV2_1 } from "../LpAccount/LpAccountV2_1";
import { DEX_OP_CODES } from "../constants";

export interface BasePoolV2_1Options extends ContractOptions {
  gasConstants?: Partial<typeof BasePoolV2_1.gasConstants>;
}

export class BasePoolV2_1 extends JettonMinter {
  public static readonly version: DEX_VERSION = DEX_VERSION.v2_1;

  public static readonly gasConstants = {
    collectFees: toNano("0.4"),
    burn: toNano("0.8"),
  };

  public readonly gasConstants;

  constructor(
    address: AddressType,
    { gasConstants, ...options }: BasePoolV2_1Options = {},
  ) {
    super(address, options);

    this.gasConstants = {
      ...BasePoolV2_1.gasConstants,
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
    params: Parameters<BasePoolV2_1["getCollectFeeTxParams"]>[1],
  ) {
    const txParams = await this.getCollectFeeTxParams(provider, params);

    return via.send(txParams);
  }

  public async createBurnBody(params: {
    amount: AmountType;
    dexCustomPayload?: Cell;
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(DEX_OP_CODES.BURN, 32)
      .storeUint(params?.queryId ?? 0, 64)
      .storeCoins(BigInt(params.amount))
      .storeAddress(null)
      .storeMaybeRef(params.dexCustomPayload)
      .endCell();
  }

  public async getBurnTxParams(
    provider: ContractProvider,
    params: {
      amount: AmountType;
      userWalletAddress: AddressType;
      dexCustomPayload?: Cell;
      gasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const [to, body] = await Promise.all([
      this.getWalletAddress(provider, params.userWalletAddress),
      this.createBurnBody({
        amount: params.amount,
        dexCustomPayload: params.dexCustomPayload,
        queryId: params.queryId,
      }),
    ]);

    const value = BigInt(params.gasAmount ?? this.gasConstants.burn);

    return { to, value, body };
  }

  public async sendBurn(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<BasePoolV2_1["getBurnTxParams"]>[1],
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

    return LpAccountV2_1.create(lpAccountAddress);
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
