import { DEX_VERSION } from "../../constants";
import { CPIPoolV2_1 } from "../../v2_1/pool/CPIPoolV2_1";

export class CPIPoolV2_2 extends CPIPoolV2_1 {
  public static override readonly version: DEX_VERSION = DEX_VERSION.v2_2;
}
