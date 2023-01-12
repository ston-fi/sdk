import type { LpAccount } from '@/contracts/lp-account/LpAccount';
import type { Address, Cell, BN, AddressType } from '@/types';

import type {
  Pool,
  ExpectedOutputsData,
  PoolAmountsData,
  PoolData,
} from './Pool';

export type PoolGasConstants = {
  collectFees: BN;
  burn: BN;
};

export interface PoolRevision {
  get gasConstants(): PoolGasConstants;

  createCollectFeesBody(
    pool: Pool,
    params?: {
      queryId?: BN;
    },
  ): Promise<Cell>;

  createBurnBody(
    pool: Pool,
    params: {
      amount: BN;
      responseAddress: AddressType;
      queryId?: BN;
    },
  ): Promise<Cell>;

  getExpectedOutputs(
    pool: Pool,
    params: {
      amount: BN;
      jettonWallet: AddressType;
    },
  ): Promise<ExpectedOutputsData>;

  getExpectedTokens(
    pool: Pool,
    params: {
      amount0: BN;
      amount1: BN;
    },
  ): Promise<BN>;

  getExpectedLiquidity(
    pool: Pool,
    params: {
      jettonAmount: BN;
    },
  ): Promise<PoolAmountsData>;

  getLpAccountAddress(
    pool: Pool,
    params: {
      ownerAddress: AddressType;
    },
  ): Promise<Address | null>;

  constructLpAccount(pool: Pool, lpAccountAddress: AddressType): LpAccount;

  getData(pool: Pool): Promise<PoolData>;
}
