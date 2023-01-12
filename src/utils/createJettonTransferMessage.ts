import TonWeb from 'tonweb';

import { OP_CODES } from '@/constants';
import type { Address, Cell, BN } from '@/types';

const {
  boc: { Cell },
  Address,
} = TonWeb;

export function createJettonTransferMessage(params: {
  toAddress: Address | string;
  jettonAmount: BN;
  payload: Cell;
  gasAmount: BN;
  queryId?: BN;
}) {
  const message = new Cell();

  message.bits.writeUint(OP_CODES.REQUEST_TRANSFER, 32);
  message.bits.writeUint(params.queryId ?? 0, 64);
  message.bits.writeCoins(params.jettonAmount);
  message.bits.writeAddress(new Address(params.toAddress));
  message.bits.writeAddress();
  message.bits.writeBit(false);
  message.bits.writeCoins(params.gasAmount);
  message.bits.writeBit(true);

  message.refs[0] = params.payload;

  return message;
}
