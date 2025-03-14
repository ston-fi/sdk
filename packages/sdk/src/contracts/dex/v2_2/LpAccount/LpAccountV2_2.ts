import { DEX_VERSION } from "../../constants";
import {
  LpAccountV2_1,
  type LpAccountV2_1Options,
} from "../../v2_1/LpAccount/LpAccountV2_1";

export interface LpAccountV2_2Options extends LpAccountV2_1Options {}

export class LpAccountV2_2 extends LpAccountV2_1 {
  public static override readonly version: DEX_VERSION = DEX_VERSION.v2_2;
}
