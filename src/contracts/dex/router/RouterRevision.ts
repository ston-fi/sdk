import type { PoolRevision } from '../pool/PoolRevision';
import type { Address, Cell, BN, AddressType, AmountType } from '@/types';

import type { Router, RouterData } from './Router';

export type RouterGasConstants = {
  swap: BN;
  provideLp: BN;
  swapForward: BN;
  provideLpForward: BN;
};

export interface RouterRevision {
  get gasConstants(): RouterGasConstants;

  createSwapBody(
    router: Router,
    params: {
      userWalletAddress: AddressType;
      minAskAmount: AmountType;
      askJettonWalletAddress: AddressType;
      referralAddress?: AddressType;
    },
  ): Promise<Cell>;

  createProvideLiquidityBody(
    router: Router,
    params: {
      routerWalletAddress: AddressType;
      minLpOut: AmountType;
    },
  ): Promise<Cell>;

  getPoolAddress(
    router: Router,
    params: {
      token0: AddressType;
      token1: AddressType;
    },
  ): Promise<Address | null>;

  constructPoolRevision(router: Router): PoolRevision;

  getData(router: Router): Promise<RouterData>;
}
