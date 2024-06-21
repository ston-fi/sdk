import { BasePoolV2 } from "./BasePoolV2";
import { CPIPoolV2 } from "./CPIPoolV2";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class PoolV2 extends BasePoolV2 {
  public static readonly CPI = CPIPoolV2;
}
