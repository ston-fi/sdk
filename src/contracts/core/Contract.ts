import type { Address, Contract as ContractInterface } from "@ton/ton";

import type { AddressType } from "@/types";
import { toAddress } from "@/utils/toAddress";

// biome-ignore lint/suspicious/noEmptyInterface: it is empty for base class but may be extended in derived classes
export interface ContractOptions {}

export abstract class Contract implements ContractInterface {
  public readonly address: Address;

  constructor(address: AddressType, options?: ContractOptions) {
    this.address = toAddress(address);
  }

  public static create<T extends Contract>(
    this: new (
      address: AddressType,
    ) => T,
    address: AddressType,
  ): T {
    // biome-ignore lint/complexity/noThisInStatic: this here is a derived class
    return new this(address);
  }
}
