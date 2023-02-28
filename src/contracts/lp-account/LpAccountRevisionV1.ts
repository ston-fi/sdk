import TonWeb from 'tonweb';

import { parseAddressFromCell } from '@/utils/parseAddressFromCell';
import { OP_CODES } from '@/constants';
import type { Cell, BN } from '@/types';

import type { LpAccountRevision } from './LpAccountRevision';

const {
  boc: { Cell },
  utils: { BN },
} = TonWeb;

export class LpAccountRevisionV1 implements LpAccountRevision {
  public get gasConstants(): LpAccountRevision['gasConstants'] {
    return {
      refund: new BN(500000000),
      directAddLp: new BN(300000000),
      resetGas: new BN(300000000),
    };
  }

  public createRefundBody: LpAccountRevision['createRefundBody'] = async (
    _lpAccount,
    params,
  ) => {
    const message = new Cell();

    message.bits.writeUint(OP_CODES.REFUND, 32);
    message.bits.writeUint(params?.queryId ?? 0, 64);

    return message;
  };

  public createDirectAddLiquidityBody: LpAccountRevision['createDirectAddLiquidityBody'] =
    async (_lpAccount, params) => {
      const message = new Cell();

      message.bits.writeUint(OP_CODES.DIRECT_ADD_LIQUIDITY, 32);
      message.bits.writeUint(params.queryId ?? 0, 64);
      message.bits.writeCoins(params.amount0);
      message.bits.writeCoins(params.amount1);
      message.bits.writeCoins(params.minimumLpToMint ?? new BN(1));

      return message;
    };

  public createResetGasBody: LpAccountRevision['createResetGasBody'] = async (
    _lpAccount,
    params,
  ) => {
    const message = new Cell();

    message.bits.writeUint(OP_CODES.RESET_GAS, 32);
    message.bits.writeUint(params?.queryId ?? 0, 64);

    return message;
  };

  public getData: LpAccountRevision['getData'] = async (lpAccount) => {
    const contractAddress = await lpAccount.getAddress();
    const result = await lpAccount.provider.call2(
      contractAddress.toString(),
      'get_lp_account_data',
    );

    return {
      userAddress: parseAddressFromCell(result[0]),
      poolAddress: parseAddressFromCell(result[1]),
      amount0: result[2] as BN,
      amount1: result[3] as BN,
    };
  };
}
