import type { ContractProvider } from "@ton/ton";

import { DEX_TYPE } from "../../constants";
import { BasePoolV2_1 } from "./BasePoolV2_1";

export class WStablePoolV2_1 extends BasePoolV2_1 {
  public static readonly dexType = DEX_TYPE.WStable;

  public override async getPoolData(provider: ContractProvider) {
    const data = await this.implGetPoolData(provider);

    return {
      ...data.commonPoolData,
      amp: data.stack.readBigNumber(),
      rate: data.stack.readBigNumber(),
      w0: data.stack.readBigNumber(),
      rateSetterAddress: data.stack.readAddressOpt(),
    };
  }
}
