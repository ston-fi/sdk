import type { PoolRevision } from '@/contracts/pool/PoolRevision';
import type { Address, Cell, BN, AddressType } from '@/types';

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
      minAskAmount: BN;
      askJettonWalletAddress: AddressType;
      referralAddress?: AddressType;
    },
  ): Promise<Cell>;

  createProvideLiquidityBody(
    router: Router,
    params: {
      routerWalletAddress: AddressType;
      minLpOut: BN;
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
