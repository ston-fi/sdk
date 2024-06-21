import { RouterV2 } from "./router/RouterV2";
import { PoolV2 } from "./pool/PoolV2";
import { LpAccountV2 } from "./LpAccount/LpAccountV2";
import { VaultV2 } from "./vault/VaultV2";

export const DEX = {
  Router: RouterV2,
  Pool: PoolV2,
  LpAccount: LpAccountV2,
  Vault: VaultV2,
} as const;
