import { DEX as DEXv1 } from "./v1";
import { DEX_VERSION } from "./constants";

export { DEX_VERSION } from "./constants";

export const DEX = {
  [DEX_VERSION.v1]: DEXv1,
} as const;
