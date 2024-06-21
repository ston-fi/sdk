import {
  type Cell,
  type ContractProvider,
  type Sender,
  type SenderArguments,
  address,
} from "@ton/ton";

import type { ContractOptions } from "@/contracts/core/Contract";
import { JettonMinter } from "@/contracts/core/JettonMinter";
import type { AddressType, AmountType, QueryIdType } from "@/types";
import { createJettonTransferMessage } from "@/utils/createJettonTransferMessage";

import { pTON_VERSION } from "../constants";

export interface PtonV1Options extends ContractOptions {}

export class PtonV1 extends JettonMinter {
  public static readonly version: pTON_VERSION = pTON_VERSION.v1;

  public static readonly address = address(
    "EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez",
  );

  constructor(address: AddressType = PtonV1.address, options?: PtonV1Options) {
    super(address, options);
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

    const body = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.tonAmount,
      destination: params.destinationAddress,
      forwardTonAmount: BigInt(params.forwardTonAmount ?? 0),
      forwardPayload: params.forwardPayload,
    });

    const value =
      BigInt(params.tonAmount) + BigInt(params.forwardTonAmount ?? 0);

    return { to, value, body };
  }

  public async sendTonTransfer(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<PtonV1["getTonTransferTxParams"]>[1],
  ) {
    const txParams = await this.getTonTransferTxParams(provider, params);

    return via.send(txParams);
  }
}
