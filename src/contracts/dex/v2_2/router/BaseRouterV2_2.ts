import { DEX_VERSION } from "@/contracts/dex/constants";
import {
  BaseRouterV2_1,
  type BaseRouterV2_1Options,
} from "@/contracts/dex/v2_1/router/BaseRouterV2_1";

export interface BaseRouterV2_2Options extends BaseRouterV2_1Options {}

export class BaseRouterV2_2 extends BaseRouterV2_1 {
  public static readonly version: DEX_VERSION = DEX_VERSION.v2_2;
}
