import type { LpAccountRevision } from '../lp-account/LpAccountRevision';
import type {
  Address,
  Cell,
  BN,
  AddressType,
  QueryIdType,
  AmountType,
} from '@/types';

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
      amount: AmountType;
      responseAddress: AddressType;
      queryId?: QueryIdType;
    },
  ): Promise<Cell>;

  getExpectedOutputs(
    pool: Pool,
    params: {
      amount: AmountType;
      jettonWallet: AddressType;
    },
  ): Promise<ExpectedOutputsData>;

  getExpectedTokens(
    pool: Pool,
    params: {
      amount0: AmountType;
      amount1: AmountType;
    },
  ): Promise<BN>;

  getExpectedLiquidity(
    pool: Pool,
    params: {
      jettonAmount: AmountType;
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
