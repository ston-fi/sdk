import type { LpAccountRevision } from '@/contracts/lp-account/LpAccountRevision';
import type { Address, Cell, BN, AddressType, QueryIdType } from '@/types';

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
      queryId?: QueryIdType;
    },
  ): Promise<Cell>;

  createBurnBody(
    pool: Pool,
    params: {
      amount: BN;
      responseAddress: AddressType;
      queryId?: QueryIdType;
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

  constructLpAccountRevision(pool: Pool): LpAccountRevision;

  getData(pool: Pool): Promise<PoolData>;
}
