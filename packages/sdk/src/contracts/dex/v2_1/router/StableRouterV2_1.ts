import type { ContractProvider } from "@ton/ton";

import type { AddressType } from "../../../../types";
import { DEX_TYPE } from "../../constants";
import { StablePoolV2_1 } from "../pool/StablePoolV2_1";
import { BaseRouterV2_1 } from "./BaseRouterV2_1";

export class StableRouterV2_1 extends BaseRouterV2_1 {
  public static readonly dexType = DEX_TYPE.Stable;

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

    return StablePoolV2_1.create(poolAddress);
  }
}
