import type { Cell, QueryIdType } from '@/types';

import type {
  FarmNftItem,
  FarmNftItemFarmingData,
  FarmNftItemGasConstants,
} from './FarmNftItem';

export interface FarmNftItemRevision {
  get gasConstants(): FarmNftItemGasConstants;

  createClaimRewardsBody(
    nft: FarmNftItem,
    params: {
      queryId?: QueryIdType;
    },
  ): Promise<Cell>;

  createUnstakeBody(
    nft: FarmNftItem,
    params: {
      queryId?: QueryIdType;
    },
  ): Promise<Cell>;

  createDestroyBody(
    nft: FarmNftItem,
    params: {
      queryId?: QueryIdType;
    },
  ): Promise<Cell>;

  getFarmingData(nft: FarmNftItem): Promise<FarmNftItemFarmingData>;
}
