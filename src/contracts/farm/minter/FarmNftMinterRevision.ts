import type { Cell } from '@/types';

import type {
  FarmNftMinter,
  FarmNftMinterData,
  FarmNftMinterGasConstants,
  PendingData,
  Version,
} from './FarmNftMinter';

export interface FarmNftMinterRevision {
  get gasConstants(): FarmNftMinterGasConstants;

  createStakeBody(minter: FarmNftMinter): Promise<Cell>;

  getPendingData(minter: FarmNftMinter): Promise<PendingData>;

  getVersion(minter: FarmNftMinter): Promise<Version>;

  getData(minter: FarmNftMinter): Promise<FarmNftMinterData>;
}
