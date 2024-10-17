import { PtonV2_1 } from "@/contracts/pTON/v2_1/PtonV2_1";

import { RouterV2_1 } from "./router/RouterV2_1";
import { PoolV2_1 } from "./pool/PoolV2_1";
import { LpAccountV2_1 } from "./LpAccount/LpAccountV2_1";
import { VaultV2_1 } from "./vault/VaultV2_1";

export const DEX = {
  Router: RouterV2_1,
  Pool: PoolV2_1,
  LpAccount: LpAccountV2_1,
  Vault: VaultV2_1,
  pTON: PtonV2_1,
} as const;
