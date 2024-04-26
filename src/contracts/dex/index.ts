import { RouterV1 } from "./v1/RouterV1";
import { PoolV1 } from "./v1/PoolV1";
import { LpAccountV1 } from "./v1/LpAccountV1";

import { DEX_VERSION } from "./constants";

export { DEX_VERSION, DEX_OP_CODES } from "./constants";

export const DEX = {
  [DEX_VERSION.v1]: {
    Router: RouterV1,
    Pool: PoolV1,
    LpAccount: LpAccountV1,
  },
} as const;
