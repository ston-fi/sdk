import { DEX_VERSION } from "./constants";
import { DEX as DEXv1 } from "./v1";
import { DEX as DEXv2 } from "./v2";

export { DEX_VERSION, DEX_TYPE } from "./constants";

export const DEX = {
  [DEX_VERSION.v1]: DEXv1,
  [DEX_VERSION.v2]: DEXv2,
} as const;
