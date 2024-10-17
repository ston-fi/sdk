import { PtonV2_1 } from "@/contracts/pTON/v2_1/PtonV2_1";

import { RouterV2_2 } from "./router/RouterV2_2";
import { PoolV2_2 } from "./pool/PoolV2_2";
import { LpAccountV2_2 } from "./LpAccount/LpAccountV2_2";
import { VaultV2_2 } from "./vault/VaultV2_2";

export const DEX = {
  Router: RouterV2_2,
  Pool: PoolV2_2,
  LpAccount: LpAccountV2_2,
  Vault: VaultV2_2,
  pTON: PtonV2_1,
} as const;
