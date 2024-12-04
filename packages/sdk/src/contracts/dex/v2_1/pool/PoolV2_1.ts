import { BasePoolV2_1 } from "./BasePoolV2_1";
import { CPIPoolV2_1 } from "./CPIPoolV2_1";
import { StablePoolV2_1 } from "./StablePoolV2_1";

export class PoolV2_1 extends BasePoolV2_1 {
  public static readonly CPI = CPIPoolV2_1;
  public static readonly Stable = StablePoolV2_1;
}
