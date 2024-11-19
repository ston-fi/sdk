import type { ContractProvider } from "@ton/ton";

import type { AddressType } from "../../../../types";
import { DEX_TYPE } from "../../constants";
import { CPIPoolV2_1 } from "../pool/CPIPoolV2_1";
import { BaseRouterV2_1 } from "./BaseRouterV2_1";

export class CPIRouterV2_1 extends BaseRouterV2_1 {
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

    return CPIPoolV2_1.create(poolAddress);
  }
}
