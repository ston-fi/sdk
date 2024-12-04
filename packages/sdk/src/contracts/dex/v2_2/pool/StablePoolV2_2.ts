import type { ContractProvider } from "@ton/ton";

import type { AddressType } from "../../../../types";
import { DEX_VERSION } from "../../constants";
import { StablePoolV2_1 } from "../../v2_1/pool/StablePoolV2_1";
import { LpAccountV2_2 } from "../LpAccount/LpAccountV2_2";

export class StablePoolV2_2 extends StablePoolV2_1 {
  public static override readonly version: DEX_VERSION = DEX_VERSION.v2_2;

  public override async getLpAccount(
    provider: ContractProvider,
    params: {
      ownerAddress: AddressType;
    },
  ) {
    const lpAccountAddress = await this.getLpAccountAddress(provider, params);

    return LpAccountV2_2.create(lpAccountAddress);
  }
}
