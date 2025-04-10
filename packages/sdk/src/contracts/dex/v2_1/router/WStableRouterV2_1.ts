import { type ContractProvider, toNano } from "@ton/ton";

import type { AddressType } from "../../../../types";
import { DEX_TYPE } from "../../constants";
import { WStablePoolV2_1 } from "../pool/WStablePoolV2_1";
import { BaseRouterV2_1, type BaseRouterV2_1Options } from "./BaseRouterV2_1";

export class WStableRouterV2_1 extends BaseRouterV2_1 {
  public static readonly dexType = DEX_TYPE.WStable;

  public static override readonly gasConstants = {
    ...BaseRouterV2_1.gasConstants,
    swapJettonToJetton: {
      gasAmount: toNano("0.479"),
      forwardGasAmount: toNano("0.419"),
    },
    swapJettonToTon: {
      gasAmount: toNano("0.479"),
      forwardGasAmount: toNano("0.419"),
    },
    swapTonToJetton: {
      forwardGasAmount: toNano("0.479"),
    },
  };

  constructor(
    address: AddressType,
    { gasConstants, ...options }: BaseRouterV2_1Options = {},
  ) {
    super(address, {
      ...options,
      gasConstants: {
        ...WStableRouterV2_1.gasConstants,
        ...gasConstants,
      },
    });
  }

  public override async getPool(
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

    return WStablePoolV2_1.create(poolAddress);
  }
}
