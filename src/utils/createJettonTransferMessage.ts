import TonWeb from 'tonweb';

import { OP_CODES } from '@/constants';
import type { AddressType, QueryIdType, AmountType, Cell } from '@/types';

const {
  boc: { Cell },
  Address,
} = TonWeb;

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
  const message = new Cell();

  message.bits.writeUint(OP_CODES.REQUEST_TRANSFER, 32);
  message.bits.writeUint(params.queryId, 64);
  message.bits.writeCoins(params.amount);
  message.bits.writeAddress(new Address(params.destination));
  message.bits.writeAddress(
    params.responseDestination
      ? new Address(params.responseDestination)
      : undefined,
  );

  if (params.customPayload) {
    message.refs.push(params.customPayload);
    message.bits.writeBit(true);
  } else {
    message.bits.writeBit(false);
  }

  message.bits.writeCoins(params.forwardTonAmount);

  if (params.forwardPayload) {
    message.refs.push(params.forwardPayload);
    message.bits.writeBit(true);
  } else {
    message.bits.writeBit(false);
  }

  return message;
}
