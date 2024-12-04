import { BaseRouterV2_2 } from "./BaseRouterV2_2";
import { CPIRouterV2_2 } from "./CPIRouterV2_2";
import { StableRouterV2_2 } from "./StableRouterV2_2";

export class RouterV2_2 extends BaseRouterV2_2 {
  public static readonly CPI = CPIRouterV2_2;
  public static readonly Stable = StableRouterV2_2;
}
