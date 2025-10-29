import { PtonV2_1 } from "../../pTON/v2_1/PtonV2_1";
import { LpAccountV2_1 } from "./LpAccount/LpAccountV2_1";
import { BasePoolV2_1 } from "./pool/BasePoolV2_1";
import { CPIPoolV2_1 } from "./pool/CPIPoolV2_1";
import { StablePoolV2_1 } from "./pool/StablePoolV2_1";
import { WCPIPoolV2_1 } from "./pool/WCPIPoolV2_1";
import { WStablePoolV2_1 } from "./pool/WStablePoolV2_1";
import { BaseRouterV2_1 } from "./router/BaseRouterV2_1";
import { CPIRouterV2_1 } from "./router/CPIRouterV2_1";
import { StableRouterV2_1 } from "./router/StableRouterV2_1";
import { WCPIRouterV2_1 } from "./router/WCPIRouterV2_1";
import { WStableRouterV2_1 } from "./router/WStableRouterV2_1";

import { VaultV2_1 } from "./vault/VaultV2_1";

export { CPIRouterV2_1, StableRouterV2_1, WCPIRouterV2_1, WStableRouterV2_1 };
export { CPIPoolV2_1, StablePoolV2_1, WCPIPoolV2_1, WStablePoolV2_1 };
export { LpAccountV2_1 };
export { VaultV2_1 } from "./vault/VaultV2_1";

/** @deprecated. Use explicit Router instead (e.g. DEX.Router.CPI) or use `dexFactory` */
export class RouterV2_1 extends BaseRouterV2_1 {
  public static readonly CPI = CPIRouterV2_1;
  public static readonly Stable = StableRouterV2_1;
  public static readonly WCPI = WCPIRouterV2_1;
  public static readonly WStable = WStableRouterV2_1;
}

/** @deprecated. Use explicit Pool instead (e.g. DEX.Pool.CPI) or use `dexFactory` */
export class PoolV2_1 extends BasePoolV2_1 {
  public static readonly CPI = CPIPoolV2_1;
  public static readonly Stable = StablePoolV2_1;
  public static readonly WCPI = WCPIPoolV2_1;
  public static readonly WStable = WStablePoolV2_1;
}

export const DEX = {
  Router: RouterV2_1,
  Pool: PoolV2_1,
  LpAccount: LpAccountV2_1,
  Vault: VaultV2_1,
  pTON: PtonV2_1,
} as const;
