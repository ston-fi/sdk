import type { Cell, BN, QueryIdType, AmountType } from '@/types';

import type { LpAccount, LpAccountData } from './LpAccount';

export type LpAccountGasConstants = {
  refund: BN;
  directAddLp: BN;
  resetGas: BN;
};

export interface LpAccountRevision {
  get gasConstants(): LpAccountGasConstants;

  createRefundBody(
    account: LpAccount,
    params?: {
      queryId?: QueryIdType;
    },
  ): Promise<Cell>;

  createDirectAddLiquidityBody(
    account: LpAccount,
    params: {
      amount0: AmountType;
      amount1: AmountType;
      minimumLpToMint?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<Cell>;

  createResetGasBody(
    account: LpAccount,
    params?: {
      queryId?: QueryIdType;
    },
  ): Promise<Cell>;

  getData(account: LpAccount): Promise<LpAccountData>;
}
