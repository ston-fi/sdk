import { BaseRouterV2 } from "./BaseRouterV2";
import { CPIRouterV2 } from "./CPIRouterV2";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class RouterV2 extends BaseRouterV2 {
  public static readonly CPI = CPIRouterV2;
}
