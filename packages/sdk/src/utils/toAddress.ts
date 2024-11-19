import { Address, address } from "@ton/ton";

import type { AddressType } from "../types";

/** Convert passed value to Address instance if it's not already */
export function toAddress(addressValue: AddressType): Address {
  if (addressValue instanceof Address) {
    return addressValue;
  }

  return address(addressValue.toString());
}
