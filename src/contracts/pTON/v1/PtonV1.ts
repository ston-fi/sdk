import TonWeb, { type ContractOptions } from "tonweb";

import type { SdkContractOptions } from "@/types";

import { pTON_VERSION } from "../constants";

const { Address, Contract } = TonWeb;

export interface PtonV1Options extends SdkContractOptions, ContractOptions {}

export class PtonV1 extends Contract {
  public static readonly version = pTON_VERSION.v1;
  public static readonly address = new Address(
    "EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez",
  );

  constructor({ tonApiClient, stonApiClient, ...options }: PtonV1Options) {
    super(tonApiClient, {
      ...options,
      address: options.address ?? PtonV1.address,
    });
  }
}
