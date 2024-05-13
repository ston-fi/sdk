import { RouterV1 } from "./RouterV1";
import { PoolV1 } from "./PoolV1";
import { LpAccountV1 } from "./LpAccountV1";

export const DEX = {
  Router: RouterV1,
  Pool: PoolV1,
  LpAccount: LpAccountV1,
} as const;
