import {
  beginCell,
  type Cell,
  type ContractProvider,
  type Sender,
  type SenderArguments,
  toNano,
} from "@ton/ton";

import type { AddressType, AmountType, QueryIdType } from "../../../types";
import { toAddress } from "../../../utils/toAddress";
import type { AbstractPton } from "../AbstractPton";
import { pTON_VERSION } from "../constants";
import { PtonV1, type PtonV1Options } from "../v1/PtonV1";
import { pTON_OP_CODES } from "./constants";

export interface PtonV2_1Options extends PtonV1Options {
  gasConstants?: Partial<typeof PtonV2_1.gasConstants>;
}

export class PtonV2_1 extends PtonV1 implements AbstractPton {
  public static override readonly version = pTON_VERSION.v2_1;

  public static override readonly gasConstants = {
    tonTransfer: toNano("0.01"),
    deployWallet: toNano("0.1"),
  };

  public override readonly version = PtonV2_1.version;

  public override readonly gasConstants;

  constructor(
    address: AddressType,
    { gasConstants, ...options }: PtonV2_1Options = {},
  ) {
    super(address, options);

    this.gasConstants = {
      ...PtonV2_1.gasConstants,
      ...gasConstants,
    };
  }

  public async createTonTransferBody(params: {
    tonAmount: AmountType;
    refundAddress: AddressType;
    forwardPayload?: Cell;
    queryId?: QueryIdType;
  }): Promise<Cell> {
    const builder = beginCell();

    builder.storeUint(pTON_OP_CODES.TON_TRANSFER, 32);
    builder.storeUint(params.queryId ?? 0, 64);
    builder.storeCoins(BigInt(params.tonAmount));
    builder.storeAddress(toAddress(params.refundAddress));

    if (params.forwardPayload) {
      builder.storeBit(true);
      builder.storeRef(params.forwardPayload);
    } else {
      builder.storeBit(false);
    }

    return builder.endCell();
  }

  public override async getTonTransferTxParams(
    provider: ContractProvider,
    params: {
      tonAmount: AmountType;
      destinationAddress: AddressType;
      destinationWalletAddress?: AddressType;
      refundAddress: AddressType;
      forwardPayload?: Cell;
      forwardTonAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = params.destinationWalletAddress
      ? toAddress(params.destinationWalletAddress)
      : await this.getWalletAddress(provider, params.destinationAddress);

    const body = await this.createTonTransferBody({
      tonAmount: params.tonAmount,
      refundAddress: params.refundAddress,
      forwardPayload: params.forwardPayload,
      queryId: params.queryId,
    });

    const value =
      BigInt(params.tonAmount) +
      BigInt(params.forwardTonAmount ?? 0) +
      BigInt(this.gasConstants.tonTransfer);

    return { to, value, body };
  }

  public override async sendTonTransfer(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<PtonV2_1["getTonTransferTxParams"]>[1],
  ) {
    const txParams = await this.getTonTransferTxParams(provider, params);

    return via.send(txParams);
  }

  public override async createDeployWalletBody(params: {
    ownerAddress: AddressType;
    excessAddress: AddressType;
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(pTON_OP_CODES.DEPLOY_WALLET, 32)
      .storeUint(params.queryId ?? 0, 64)
      .storeAddress(toAddress(params.ownerAddress))
      .storeAddress(toAddress(params.excessAddress))
      .endCell();
  }

  public override async getDeployWalletTxParams(
    provider: ContractProvider,
    params: {
      ownerAddress: AddressType;
      excessAddress: AddressType;
      gasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = this.address;

    const body = await this.createDeployWalletBody({
      ownerAddress: params.ownerAddress,
      excessAddress: params.excessAddress,
      queryId: params?.queryId,
    });

    const value = BigInt(params?.gasAmount ?? this.gasConstants.deployWallet);

    return { to, value, body };
  }

  public override async sendDeployWallet(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<PtonV2_1["getDeployWalletTxParams"]>[1],
  ) {
    const txParams = await this.getDeployWalletTxParams(provider, params);

    return via.send(txParams);
  }
}
