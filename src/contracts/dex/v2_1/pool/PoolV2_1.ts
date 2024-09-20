import { BasePoolV2_1 } from "./BasePoolV2_1";
import { CPIPoolV2_1 } from "./CPIPoolV2_1";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class PoolV2_1 extends BasePoolV2_1 {
  public static readonly CPI = CPIPoolV2_1;
}
