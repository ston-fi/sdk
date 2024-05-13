import { DEX_VERSION } from "./constants";
import { DEX as DEXv1 } from "./v1";

export { DEX_VERSION, DEX_OP_CODES } from "./constants";

export const DEX = {
  [DEX_VERSION.v1]: DEXv1,
} as const;
