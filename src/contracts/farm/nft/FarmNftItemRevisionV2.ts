import TonWeb from 'tonweb';

import { FARM_OP_CODES } from '../constants';
import type { Cell, BN } from '@/types';
import { createSbtDestroyMessage } from '@/utils/createSbtDestroyMessage';

import type { FarmNftItemRevision } from './FarmNftItemRevision';

const {
  utils: { BN },
  boc: { Cell },
} = TonWeb;

export class FarmNftItemRevisionV2 implements FarmNftItemRevision {
  public get gasConstants(): FarmNftItemRevision['gasConstants'] {
    return {
      claimRewards: new BN(300000000),
      unstake: new BN(400000000),
      destroy: new BN(50000000),
    };
  }

  public createClaimRewardsBody: FarmNftItemRevision['createClaimRewardsBody'] =
    async (_nft, params) => {
      const message = new Cell();

      message.bits.writeUint(FARM_OP_CODES.CLAIM_REWARDS, 32);
      message.bits.writeUint(params?.queryId ?? 0, 64);

      return message;
    };

  public createUnstakeBody: FarmNftItemRevision['createUnstakeBody'] = async (
    _nft,
    params,
  ) => {
    const message = new Cell();

    message.bits.writeUint(FARM_OP_CODES.UNSTAKE, 32);
    message.bits.writeUint(params?.queryId ?? 0, 64);

    return message;
  };

  public createDestroyBody: FarmNftItemRevision['createDestroyBody'] = async (
    _nft,
    params,
  ) => {
    return createSbtDestroyMessage({
      queryId: params?.queryId ?? 0,
    });
  };

  public getFarmingData: FarmNftItemRevision['getFarmingData'] = async (
    nft,
  ) => {
    const contractAddress = await nft.getAddress();

    const result = await nft.provider.call2(
      contractAddress.toString(),
      'get_farming_data',
    );

    return {
      status: result[0] as number,
      revokeTime: result[1] as BN,
      stakedTokens: result[2] as BN,
      claimedPerUnitNanorewards: result[3] as BN,
      stakeDate: result[4] as BN,

      // NFTs are always soulbound in V2
      isSoulbound: true,
    };
  };
}
