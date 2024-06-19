import { address } from "@ton/ton";

import type { ContractOptions } from "@/contracts/core/Contract";
import { JettonMinter } from "@/contracts/core/JettonMinter";
import type { AddressType } from "@/types";

import { pTON_VERSION } from "../constants";

export interface PtonV1Options extends ContractOptions {}

export class PtonV1 extends JettonMinter {
  public static readonly version = pTON_VERSION.v1;

  public static readonly address = address(
    "EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez",
  );

  constructor(address: AddressType = PtonV1.address, options?: PtonV1Options) {
    super(address, options);
  }
}
