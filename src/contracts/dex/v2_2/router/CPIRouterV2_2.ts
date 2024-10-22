import { DEX_VERSION } from "@/contracts/dex/constants";
import { CPIRouterV2_1 } from "@/contracts/dex/v2_1/router/CPIRouterV2_1";

export class CPIRouterV2_2 extends CPIRouterV2_1 {
  public static readonly version: DEX_VERSION = DEX_VERSION.v2_2;
}
