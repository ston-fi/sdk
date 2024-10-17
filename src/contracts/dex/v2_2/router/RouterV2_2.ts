import { BaseRouterV2_2 } from "./BaseRouterV2_2";
import { CPIRouterV2_2 } from "./CPIRouterV2_2";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class RouterV2_2 extends BaseRouterV2_2 {
  public static readonly CPI = CPIRouterV2_2;
}
