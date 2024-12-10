import type {
  Address,
  Cell,
  ContractProvider,
  SenderArguments,
} from "@ton/ton";

import type { AddressType, AmountType, QueryIdType } from "../../types";
import type { pTON_VERSION } from "./constants";

export interface AbstractPton {
  version: pTON_VERSION;
  address: Address;

  getTonTransferTxParams(
    provider: ContractProvider,
    params: {
      tonAmount: AmountType;
      destinationAddress: AddressType;
      refundAddress: AddressType;
      forwardPayload?: Cell;
      forwardTonAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments>;
}
