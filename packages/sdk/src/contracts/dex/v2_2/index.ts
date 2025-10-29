import { PtonV2_1 } from "../../pTON/v2_1/PtonV2_1";
import { LpAccountV2_2 } from "./LpAccount/LpAccountV2_2";
import { BasePoolV2_2 } from "./pool/BasePoolV2_2";
import { CPIPoolV2_2 } from "./pool/CPIPoolV2_2";
import { StablePoolV2_2 } from "./pool/StablePoolV2_2";
import { WCPIPoolV2_2 } from "./pool/WCPIPoolV2_2";
import { WStablePoolV2_2 } from "./pool/WStablePoolV2_2";
import { BaseRouterV2_2 } from "./router/BaseRouterV2_2";
import { CPIRouterV2_2 } from "./router/CPIRouterV2_2";
import { StableRouterV2_2 } from "./router/StableRouterV2_2";
import { WCPIRouterV2_2 } from "./router/WCPIRouterV2_2";
import { WStableRouterV2_2 } from "./router/WStableRouterV2_2";
import { VaultV2_2 } from "./vault/VaultV2_2";

export { CPIRouterV2_2, StableRouterV2_2, WCPIRouterV2_2, WStableRouterV2_2 };
export { CPIPoolV2_2, StablePoolV2_2, WCPIPoolV2_2, WStablePoolV2_2 };
export { LpAccountV2_2 };
export { VaultV2_2 };

/** @deprecated. Use explicit Router instead (e.g. DEX.Router.CPI) or use `dexFactory` */
export class RouterV2_2 extends BaseRouterV2_2 {
  public static readonly CPI = CPIRouterV2_2;
  public static readonly Stable = StableRouterV2_2;
  public static readonly WCPI = WCPIRouterV2_2;
  public static readonly WStable = WStableRouterV2_2;
}

/** @deprecated. Use explicit Pool instead (e.g. DEX.Pool.CPI) or use `dexFactory` */
export class PoolV2_2 extends BasePoolV2_2 {
  public static readonly CPI = CPIPoolV2_2;
  public static readonly Stable = StablePoolV2_2;
  public static readonly WCPI = WCPIPoolV2_2;
  public static readonly WStable = WStablePoolV2_2;
}

export const DEX = {
  Router: RouterV2_2,
  Pool: PoolV2_2,
  LpAccount: LpAccountV2_2,
  Vault: VaultV2_2,
  pTON: PtonV2_1,
} as const;
