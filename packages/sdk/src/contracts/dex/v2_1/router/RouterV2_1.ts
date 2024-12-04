import { BaseRouterV2_1 } from "./BaseRouterV2_1";
import { CPIRouterV2_1 } from "./CPIRouterV2_1";
import { StableRouterV2_1 } from "./StableRouterV2_1";

export class RouterV2_1 extends BaseRouterV2_1 {
  public static readonly CPI = CPIRouterV2_1;
  public static readonly Stable = StableRouterV2_1;
}
