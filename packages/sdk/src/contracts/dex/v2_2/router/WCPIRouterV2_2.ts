import type { ContractProvider } from "@ton/ton";

import type { AddressType } from "../../../../types";
import { JettonMinter } from "../../../core/JettonMinter";
import { DEX_VERSION } from "../../constants";
import { WCPIRouterV2_1 } from "../../v2_1/router/WCPIRouterV2_1";
import { WCPIPoolV2_2 } from "../pool/WCPIPoolV2_2";
import { VaultV2_2 } from "../vault/VaultV2_2";

export class WCPIRouterV2_2 extends WCPIRouterV2_1 {
  public static override readonly version: DEX_VERSION = DEX_VERSION.v2_2;

  public override async getPool(
    provider: ContractProvider,
    params: {
      token0: AddressType;
      token1: AddressType;
    },
  ) {
    const poolAddress = await this.getPoolAddressByJettonMinters(
      provider,
      params,
    );

    return WCPIPoolV2_2.create(poolAddress);
  }

  public override async getVault(
    provider: ContractProvider,
    params: {
      user: AddressType;
      tokenMinter: AddressType;
    },
  ) {
    const tokenMinter = provider.open(JettonMinter.create(params.tokenMinter));

    const vaultAddress = await this.getVaultAddress(provider, {
      user: params.user,
      tokenWallet: await tokenMinter.getWalletAddress(this.address),
    });

    return VaultV2_2.create(vaultAddress);
  }
}
