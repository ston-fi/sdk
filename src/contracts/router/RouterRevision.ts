import type { Pool } from '@/contracts/pool/Pool';
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
      offerAmount: BN;
      minAskAmount: BN;
      askJettonWalletAddress: AddressType;
      forwardGasAmount?: BN;
      queryId?: BN;
    },
  ): Promise<Cell>;

  createProvideLiquidityBody(
    router: Router,
    params: {
      routerWalletAddress: AddressType;
      lpAmount: BN;
      minLpOut: BN;
      forwardGasAmount?: BN;
      queryId?: BN;
    },
  ): Promise<Cell>;

  getPoolAddress(
    router: Router,
    params: {
      token0: AddressType;
      token1: AddressType;
    },
  ): Promise<Address | null>;

  constructPool(router: Router, poolAddress: AddressType): Pool;

  getData(router: Router): Promise<RouterData>;
}
