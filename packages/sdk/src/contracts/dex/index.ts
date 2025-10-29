import { DEX_VERSION } from "./constants";
import { DEX as DEXv1 } from "./v1";
import { DEX as DEXv2_1 } from "./v2_1";
import { DEX as DEXv2_2 } from "./v2_2";

export { DEX_TYPE, DEX_VERSION } from "./constants";

export const DEX = {
  [DEX_VERSION.v1]: DEXv1,
  [DEX_VERSION.v2_1]: DEXv2_1,
  [DEX_VERSION.v2_2]: DEXv2_2,
} as const;
