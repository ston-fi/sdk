import {
  type Cell,
  type ContractProvider,
  type Sender,
  type SenderArguments,
  address,
  beginCell,
  toNano,
} from "@ton/ton";

import type { ContractOptions } from "@/contracts/core/Contract";
import { JettonMinter } from "@/contracts/core/JettonMinter";
import type { AddressType, AmountType, QueryIdType } from "@/types";
import { createJettonTransferMessage } from "@/utils/createJettonTransferMessage";
import { toAddress } from "@/utils/toAddress";

import { pTON_VERSION } from "../constants";

import { pTON_OP_CODES } from "./constants";

export interface PtonV1Options extends ContractOptions {
  gasConstants?: Partial<typeof PtonV1.gasConstants>;
}

export class PtonV1 extends JettonMinter {
  public static readonly version: pTON_VERSION = pTON_VERSION.v1;

  public static readonly address = address(
    "EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez",
  );

  public static readonly gasConstants = {
    deployWallet: toNano("1.05"),
  };

  public readonly gasConstants;

  constructor(
    address: AddressType = PtonV1.address,
    { gasConstants, ...options }: PtonV1Options = {},
  ) {
    super(address, options);

    this.gasConstants = {
      ...PtonV1.gasConstants,
      ...gasConstants,
    };
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

  public async createDeployWalletBody(params: {
    ownerAddress: AddressType;
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(pTON_OP_CODES.DEPLOY_WALLET, 32)
      .storeUint(params.queryId ?? 0, 64)
      .storeAddress(toAddress(params.ownerAddress))
      .endCell();
  }

  public async getDeployWalletTxParams(
    provider: ContractProvider,
    params: {
      ownerAddress: AddressType;
      gasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = this.address;

    const body = await this.createDeployWalletBody({
      ownerAddress: params.ownerAddress,
      queryId: params?.queryId,
    });

    const value = BigInt(params?.gasAmount ?? this.gasConstants.deployWallet);

    return { to, value, body };
  }

  public async sendDeployWallet(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<PtonV1["getDeployWalletTxParams"]>[1],
  ) {
    const txParams = await this.getDeployWalletTxParams(provider, params);

    return via.send(txParams);
  }
}
