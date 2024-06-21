import {
  type Cell,
  type ContractProvider,
  type Sender,
  type SenderArguments,
  beginCell,
  toNano,
} from "@ton/ton";

import type { AddressType, AmountType, QueryIdType } from "@/types";
import { toAddress } from "@/utils/toAddress";

import { pTON_VERSION, pTON_OP_CODES } from "../constants";
import { PtonV1, type PtonV1Options } from "../v1/PtonV1";

export interface PtonV2Options extends PtonV1Options {
  gasConstants?: Partial<typeof PtonV2.gasConstants>;
}

export class PtonV2 extends PtonV1 {
  public static readonly version = pTON_VERSION.v2;

  public static readonly gasConstants = {
    tonTransfer: toNano("0.01"),
  };

  public readonly gasConstants;

  constructor(
    address: AddressType,
    { gasConstants, ...options }: PtonV2Options = {},
  ) {
    super(address, options);

    this.gasConstants = {
      ...PtonV2.gasConstants,
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
    }

    return builder.endCell();
  }

  public async getTonTransferTxParams(
    provider: ContractProvider,
    params: {
      tonAmount: AmountType;
      destinationAddress: AddressType;
      refundAddress: AddressType;
      forwardPayload?: Cell;
      forwardTonAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = await this.getWalletAddress(provider, params.destinationAddress);

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

  public async sendTonTransfer(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<PtonV2["getTonTransferTxParams"]>[1],
  ) {
    const txParams = await this.getTonTransferTxParams(provider, params);

    return via.send(txParams);
  }
}
