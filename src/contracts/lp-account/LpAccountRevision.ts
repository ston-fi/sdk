import type { Cell, BN } from '@/types';

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
      queryId?: BN;
    },
  ): Promise<Cell>;

  createDirectAddLiquidityBody(
    account: LpAccount,
    params: {
      amount0: BN;
      amount1: BN;
      miniumLpToMint?: BN;
      queryId?: BN;
    },
  ): Promise<Cell>;

  createResetGasBody(
    account: LpAccount,
    params?: {
      queryId?: BN;
    },
  ): Promise<Cell>;

  getData(account: LpAccount): Promise<LpAccountData>;
}
