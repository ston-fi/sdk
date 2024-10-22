import { BasePoolV2_2 } from "./BasePoolV2_2";

import { CPIPoolV2_2 } from "./CPIPoolV2_2";

export class PoolV2_2 extends BasePoolV2_2 {
  public static readonly CPI = CPIPoolV2_2;
}
