import TonWeb from "tonweb";

import type { StonApiClient as IStonApiClient } from "@/types";

const {
  HttpProvider,
  Address,
  token: {
    jetton: { JettonMinter },
  },
} = TonWeb;

/**
 * This is an implementation of the StonApiClient needed for SDK to work
 * that use TON API via TonWeb http provider instead of Ston.fi public API
 */
export class StonApiClient implements IStonApiClient {
  protected readonly tonApiProvider;

  constructor(tonApiProvider: InstanceType<typeof HttpProvider>) {
    this.tonApiProvider = tonApiProvider;
  }

  async getJettonWalletAddress({
    jettonAddress,
    ownerAddress,
  }: { jettonAddress: string; ownerAddress: string }) {
    const jettonMinter = new JettonMinter(
      this.tonApiProvider,
      // @ts-expect-error - not all parameters are really required here
      {
        address: jettonAddress,
      },
    );
    const walletAddress = await jettonMinter.getJettonWalletAddress(
      new Address(ownerAddress),
    );

    return walletAddress.toString();
  }
}
