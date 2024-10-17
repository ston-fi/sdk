import { DEX_VERSION } from "@/contracts/dex/constants";
import {
  BasePoolV2_1,
  type BasePoolV2_1Options,
} from "@/contracts/dex/v2_1/pool/BasePoolV2_1";

export interface BasePoolV2_2Options extends BasePoolV2_1Options {}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class BasePoolV2_2 extends BasePoolV2_1 {
  public static readonly version: DEX_VERSION = DEX_VERSION.v2_2;
}
