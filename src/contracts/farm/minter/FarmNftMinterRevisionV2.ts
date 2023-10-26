import TonWeb from 'tonweb';

import type { Cell, BN } from '@/types';
import { FARM_OP_CODES } from '../constants';
import { parseAddress } from '@/utils/parseAddress';
import { parseBoolean } from '@/utils/parseBoolean';
import { parseString } from '@/utils/parseString';

import type { FarmNftMinterRevision } from './FarmNftMinterRevision';

const {
  utils: { BN },
  boc: { Cell },
} = TonWeb;

export class FarmNftMinterRevisionV2 implements FarmNftMinterRevision {
  public get gasConstants(): FarmNftMinterRevision['gasConstants'] {
    return {
      stake: new BN(300000000),
      stakeForward: new BN(250000000),
    };
  }

  public createStakeBody: FarmNftMinterRevision['createStakeBody'] = async (
    _minter,
  ) => {
    const payload = new Cell();

    payload.bits.writeUint(FARM_OP_CODES.STAKE, 32);

    return payload;
  };

  public getPendingData: FarmNftMinterRevision['getPendingData'] = async (
    minter,
  ) => {
    const contractAddress = await minter.getAddress();

    const result = await minter.provider.call2(
      contractAddress.toString(),
      'get_pending_data',
    );

    return {
      changeCustodianTs: result[0] as BN,
      sendMsgTs: result[1] as BN,
      codeUpgradeTs: result[2] as BN,
      newCustodian: parseAddress(result[3]),
      pendingMsg: result[4] as Cell,
      newCode: result[5] as Cell,
      newStorage: result[6] as Cell,
    };
  };

  public getVersion: FarmNftMinterRevision['getVersion'] = async (minter) => {
    const contractAddress = await minter.getAddress();

    const result = await minter.provider.call2(
      contractAddress.toString(),
      'get_version',
    );

    return {
      major: result[0] as number,
      minor: result[1] as number,
      development: parseString(result[2]),
    };
  };

  public getData: FarmNftMinterRevision['getData'] = async (minter) => {
    const contractAddress = await minter.getAddress();

    const result = await minter.provider.call2(
      contractAddress.toString(),
      'get_farming_minter_data',
    );

    const stakingTokenWallet = parseAddress(result[14]);

    if (!stakingTokenWallet) {
      throw new Error(
        `Failed to parse stakingTokenWallet from cell: ${result[14]}`,
      );
    }

    const rewardTokenWallet = parseAddress(result[15]);

    if (!rewardTokenWallet) {
      throw new Error(
        `Failed to parse rewardTokenWallet from cell: ${result[15]}`,
      );
    }

    return {
      nextItemIndex: result[0] as BN,
      lastUpdateTime: result[1] as BN,
      status: result[2] as number,
      depositedNanorewards: result[3] as BN,
      currentStakedTokens: result[4] as BN,
      accruedPerUnitNanorewards: result[5] as BN,
      claimedFeeNanorewards: result[6] as BN,
      accruedFeeNanorewards: result[7] as BN,
      accruedNanorewards: result[8] as BN,
      claimedNanorewards: result[9] as BN,
      contractUniqueId: result[10] as BN,
      nanorewardsPer24h: result[11] as BN,
      adminFee: result[12] as BN,
      minStakeTime: result[13] as BN,
      stakingTokenWallet,
      rewardTokenWallet,
      custodianAddress: parseAddress(result[16]),
      canChangeCustodian: parseBoolean(result[17]),
      canSendRawMsg: parseBoolean(result[18]),
      canChangeFee: parseBoolean(result[19]),
      unrestrictedDepositRewards: parseBoolean(result[20]),

      // NFTs are always soulbound in V2
      soulboundItems: true,
    };
  };
}
