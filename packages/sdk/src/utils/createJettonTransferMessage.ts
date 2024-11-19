import { type Cell, beginCell } from "@ton/ton";

import type { AddressType, AmountType, QueryIdType } from "../types";
import { toAddress } from "./toAddress";

/**
 * Implements `transfer` function from Jettons Standard.
 * [Docs](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md#1-transfer)
 *
 * ```TL-B
 * transfer#0f8a7ea5 query_id:uint64 amount:(VarUInteger 16) destination:MsgAddress response_destination:MsgAddress custom_payload:(Maybe ^Cell) forward_ton_amount:(VarUInteger 16) forward_payload:(Either Cell ^Cell) = InternalMsgBody;
 * ```
 */
export function createJettonTransferMessage(params: {
  queryId: QueryIdType;
  amount: AmountType;
  destination: AddressType;
  responseDestination?: AddressType;
  customPayload?: Cell;
  forwardTonAmount: AmountType;
  forwardPayload?: Cell;
}) {
  const builder = beginCell();

  builder.storeUint(0xf8a7ea5, 32);
  builder.storeUint(params.queryId, 64);
  builder.storeCoins(BigInt(params.amount));
  builder.storeAddress(toAddress(params.destination));
  builder.storeAddress(
    params.responseDestination
      ? toAddress(params.responseDestination)
      : undefined,
  );

  if (params.customPayload) {
    builder.storeBit(true);
    builder.storeRef(params.customPayload);
  } else {
    builder.storeBit(false);
  }

  builder.storeCoins(BigInt(params.forwardTonAmount));

  if (params.forwardPayload) {
    builder.storeBit(true);
    builder.storeRef(params.forwardPayload);
  } else {
    builder.storeBit(false);
  }

  return builder.endCell();
}
