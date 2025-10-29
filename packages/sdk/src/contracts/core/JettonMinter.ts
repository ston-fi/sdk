import { beginCell, type ContractProvider } from "@ton/ton";

import type { AddressType } from "../../types";
import { toAddress } from "../../utils/toAddress";
import { Contract } from "./Contract";

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
