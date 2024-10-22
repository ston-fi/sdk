import { DEX_VERSION } from "@/contracts/dex/constants";
import { CPIPoolV2_1 } from "@/contracts/dex/v2_1/pool/CPIPoolV2_1";

export class CPIPoolV2_2 extends CPIPoolV2_1 {
  public static readonly version: DEX_VERSION = DEX_VERSION.v2_2;
}
