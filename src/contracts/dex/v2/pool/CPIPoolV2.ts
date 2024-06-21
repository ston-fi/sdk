import type { ContractProvider } from "@ton/ton";

import { DEX_TYPE } from "@/contracts/dex/constants";

import { BasePoolV2 } from "./BasePoolV2";

export class CPIPoolV2 extends BasePoolV2 {
  public static readonly dexType = DEX_TYPE.CPI;

  public async getPoolData(provider: ContractProvider) {
    const data = await this.implGetPoolData(provider);

    return {
      ...data.commonPoolData,
    };
  }
}
