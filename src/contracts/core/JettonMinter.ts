import { type ContractProvider, beginCell } from "@ton/ton";

import { Contract } from "@/contracts/core/Contract";
import type { AddressType } from "@/types";
import { toAddress } from "@/utils/toAddress";

export class JettonMinter extends Contract {
  async getWalletAddress(
    provider: ContractProvider,
    ownerAddress: AddressType,
  ) {
    const result = await provider.get("get_wallet_address", [
      {
        type: "slice",
        cell: beginCell().storeAddress(toAddress(ownerAddress)).endCell(),
      },
    ]);

    return result.stack.readAddress();
  }

  async getJettonData(provider: ContractProvider) {
    const result = await provider.get("get_jetton_data", []);

    const jettonData = {
      totalSupply: result.stack.readBigNumber(),
      canIncSupply: Boolean(result.stack.readNumber()),
      adminAddress: result.stack.readAddressOpt(),
      contentRaw: result.stack.readCell(),
      jettonWalletCode: result.stack.readCell(),
    };

    return jettonData;
  }
}
