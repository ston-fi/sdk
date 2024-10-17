import { DEX_VERSION } from "@/contracts/dex/constants";
import {
  LpAccountV2_1,
  type LpAccountV2_1Options,
} from "@/contracts/dex/v2_1/LpAccount/LpAccountV2_1";

export interface LpAccountV2_2Options extends LpAccountV2_1Options {}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class LpAccountV2_2 extends LpAccountV2_1 {
  public static readonly version: DEX_VERSION = DEX_VERSION.v2_2;
}
