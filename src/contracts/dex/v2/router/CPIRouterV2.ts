import type { ContractProvider } from "@ton/ton";

import type { AddressType } from "@/types";
import { DEX_TYPE } from "@/contracts/dex";

import { CPIPoolV2 } from "../pool/CPIPoolV2";

import { BaseRouterV2 } from "./BaseRouterV2";

export class CPIRouterV2 extends BaseRouterV2 {
  public static readonly dexType = DEX_TYPE.CPI;

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

    return CPIPoolV2.create(poolAddress);
  }
}
