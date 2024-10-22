import { DEX_VERSION } from "@/contracts/dex/constants";
import {
  VaultV2_1,
  type VaultV2_1Options,
} from "@/contracts/dex/v2_1/vault/VaultV2_1";

export interface VaultV2_2Options extends VaultV2_1Options {}

/**
 * Token vault stores referral fees on a separate contract similar to an LP account.
 * This will allow us to decrease TX fees for swaps since users won't have to pay for additional Jetton transfer TX.
 *
 * Vault address is defined by router_address, owner_address and router_token_Wallet_address,
 * so, for each token, each user can have a dedicated vault contract.
 */

export class VaultV2_2 extends VaultV2_1 {
  public static readonly version = DEX_VERSION.v2_2;
}
