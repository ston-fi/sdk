import TonWeb from 'tonweb';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { createMockObj } from '@/tests/utils';
import { FARM_REVISION } from '../constants';

import { FarmNftItem, type FarmNftItemFarmingData } from './FarmNftItem';
import type { FarmNftItemRevision } from './FarmNftItemRevision';

const {
  Address,
  boc: { Cell },
  utils: { BN, bytesToBase64 },
} = TonWeb;

const PROVIDER = createMockObj<FarmNftItem['provider']>();
const FARM_NFT_ITEM_ADDRESS =
  'EQCGC83Vj6THtc34339ypEtpYReCRSJpeVRvQJRYqVGvS78h';
const FARM_NFT_ITEM_REVISION = createMockObj<FarmNftItemRevision>({
  gasConstants: {
    claimRewards: new BN(1),
    unstake: new BN(2),
    destroy: new BN(3),
  },
  createClaimRewardsBody: vi.fn(() => {
    const cell = new Cell();
    cell.bits.writeString('createClaimRewardsBody');

    return cell;
  }),
  createUnstakeBody: vi.fn(() => {
    const cell = new Cell();
    cell.bits.writeString('createUnstakeBody');

    return cell;
  }),
  createDestroyBody: vi.fn(() => {
    const cell = new Cell();
    cell.bits.writeString('createDestroyBody');

    return cell;
  }),
  getFarmingData: vi.fn(() => {
    const farmingData: FarmNftItemFarmingData = {
      status: 0,
      isSoulbound: true,
      stakedTokens: new BN(1),
      claimedPerUnitNanorewards: new BN(2),
      stakeDate: new BN(3),
      revokeTime: new BN('0'),
    };

    return farmingData;
  }),
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('FarmNftItem', () => {
  describe('constructor', () => {
    it('should build farm NFT contract with a custom revision class', () => {
      const revision = createMockObj<FarmNftItemRevision>({});
      const farmNFT = new FarmNftItem(PROVIDER, {
        revision,
        address: FARM_NFT_ITEM_ADDRESS,
      });

      expect(farmNFT).toBeInstanceOf(FarmNftItem);
    });
    it('should build farm NFT contract with a specific string revision', () => {
      const farmNFT = new FarmNftItem(PROVIDER, {
        revision: FARM_REVISION.V2,
        address: FARM_NFT_ITEM_ADDRESS,
      });

      expect(farmNFT).toBeInstanceOf(FarmNftItem);
    });
    it('should throw if unknown string revision is provided', () => {
      expect(
        () =>
          new FarmNftItem(PROVIDER, {
            revision: 'unknown' as any,
            address: FARM_NFT_ITEM_ADDRESS,
          }),
      ).toThrow();
    });
  });

  describe('gasConstants', () => {
    it('should return gas constants from revision', () => {
      const farmNFT = new FarmNftItem(PROVIDER, {
        revision: FARM_NFT_ITEM_REVISION,
        address: FARM_NFT_ITEM_ADDRESS,
      });

      expect(farmNFT.gasConstants).toBe(FARM_NFT_ITEM_REVISION.gasConstants);
    });
  });

  describe('createClaimRewardsBody', () => {
    it('should call revision.createClaimRewardsBody with all params and return expected result', async () => {
      const farmNFT = new FarmNftItem(PROVIDER, {
        revision: FARM_NFT_ITEM_REVISION,
        address: FARM_NFT_ITEM_ADDRESS,
      });

      const params: Parameters<FarmNftItem['createClaimRewardsBody']> = [
        {
          queryId: 123,
        },
      ];

      const body = await farmNFT.createClaimRewardsBody(...params);

      expect(
        FARM_NFT_ITEM_REVISION.createClaimRewardsBody,
      ).toHaveBeenCalledTimes(1);
      expect(
        FARM_NFT_ITEM_REVISION.createClaimRewardsBody,
      ).toHaveBeenCalledWith(farmNFT, ...params);

      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAGAAAACxjcmVhdGVDbGFpbVJld2FyZHNCb2R5pwmWFg=="',
      );
    });
  });

  describe('createUnstakeBody', () => {
    it('should call revision.createUnstakeBody with all params and return expected result', async () => {
      const farmNFT = new FarmNftItem(PROVIDER, {
        revision: FARM_NFT_ITEM_REVISION,
        address: FARM_NFT_ITEM_ADDRESS,
      });

      const params: Parameters<FarmNftItem['createUnstakeBody']> = [
        {
          queryId: 123,
        },
      ];

      const body = await farmNFT.createUnstakeBody(...params);

      expect(FARM_NFT_ITEM_REVISION.createUnstakeBody).toHaveBeenCalledTimes(1);
      expect(FARM_NFT_ITEM_REVISION.createUnstakeBody).toHaveBeenCalledWith(
        farmNFT,
        ...params,
      );

      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEwAAACJjcmVhdGVVbnN0YWtlQm9kee6ehAo="',
      );
    });
  });

  describe('getFarmingData', () => {
    it('should call revision.getFarmingData with all params and return expected result', async () => {
      const farmNFT = new FarmNftItem(PROVIDER, {
        revision: FARM_NFT_ITEM_REVISION,
        address: FARM_NFT_ITEM_ADDRESS,
      });

      const farmingData = await farmNFT.getFarmingData();

      expect(FARM_NFT_ITEM_REVISION.getFarmingData).toHaveBeenCalledTimes(1);
      expect(FARM_NFT_ITEM_REVISION.getFarmingData).toHaveBeenCalledWith(
        farmNFT,
      );

      expect(farmingData).toMatchInlineSnapshot(`
        {
          "claimedPerUnitNanorewards": "02",
          "isSoulbound": true,
          "revokeTime": "00",
          "stakeDate": "03",
          "stakedTokens": "01",
          "status": 0,
        }
      `);
    });
  });

  describe('buildClaimRewardsTxParams', () => {
    it('should build expected params by using createClaimRewardsBody method', async () => {
      const farmNFT = new FarmNftItem(PROVIDER, {
        revision: FARM_NFT_ITEM_REVISION,
        address: FARM_NFT_ITEM_ADDRESS,
      });

      const txParams = await farmNFT.buildClaimRewardsTxParams();

      expect(
        FARM_NFT_ITEM_REVISION.createClaimRewardsBody,
      ).toHaveBeenCalledTimes(1);
      expect(
        FARM_NFT_ITEM_REVISION.createClaimRewardsBody,
      ).toHaveBeenCalledWith(farmNFT, {});

      expect(txParams.to).toEqual(new Address(FARM_NFT_ITEM_ADDRESS));
      expect(
        bytesToBase64(await txParams.payload.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAQEAGAAAACxjcmVhdGVDbGFpbVJld2FyZHNCb2R5pwmWFg=="',
      );
      expect(txParams.gasAmount).toEqual(
        FARM_NFT_ITEM_REVISION.gasConstants.claimRewards,
      );
    });
    it('should build expected params when gasAmount is defined', async () => {
      const farmNFT = new FarmNftItem(PROVIDER, {
        revision: FARM_NFT_ITEM_REVISION,
        address: FARM_NFT_ITEM_ADDRESS,
      });

      const gasAmount = new BN(123);
      const txParams = await farmNFT.buildClaimRewardsTxParams({
        gasAmount,
      });

      expect(
        FARM_NFT_ITEM_REVISION.createClaimRewardsBody,
      ).toHaveBeenCalledTimes(1);
      expect(
        FARM_NFT_ITEM_REVISION.createClaimRewardsBody,
      ).toHaveBeenCalledWith(farmNFT, {});

      expect(txParams.to).toEqual(new Address(FARM_NFT_ITEM_ADDRESS));
      expect(
        bytesToBase64(await txParams.payload.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAQEAGAAAACxjcmVhdGVDbGFpbVJld2FyZHNCb2R5pwmWFg=="',
      );
      expect(txParams.gasAmount).toEqual(gasAmount);
    });
    it('should build expected params when queryId is defined', async () => {
      const farmNFT = new FarmNftItem(PROVIDER, {
        revision: FARM_NFT_ITEM_REVISION,
        address: FARM_NFT_ITEM_ADDRESS,
      });

      const queryId = 12345;
      const txParams = await farmNFT.buildClaimRewardsTxParams({
        queryId,
      });

      expect(
        FARM_NFT_ITEM_REVISION.createClaimRewardsBody,
      ).toHaveBeenCalledTimes(1);
      expect(
        FARM_NFT_ITEM_REVISION.createClaimRewardsBody,
      ).toHaveBeenCalledWith(farmNFT, {
        queryId,
      });

      expect(txParams.to).toEqual(new Address(FARM_NFT_ITEM_ADDRESS));
      expect(
        bytesToBase64(await txParams.payload.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAQEAGAAAACxjcmVhdGVDbGFpbVJld2FyZHNCb2R5pwmWFg=="',
      );
      expect(txParams.gasAmount).toEqual(
        FARM_NFT_ITEM_REVISION.gasConstants.claimRewards,
      );
    });
  });

  describe('buildUnstakeTxParams', () => {
    it('should build expected params by using createUnstakeBody method', async () => {
      const farmNFT = new FarmNftItem(PROVIDER, {
        revision: FARM_NFT_ITEM_REVISION,
        address: FARM_NFT_ITEM_ADDRESS,
      });

      const params = await farmNFT.buildUnstakeTxParams();

      expect(FARM_NFT_ITEM_REVISION.createUnstakeBody).toHaveBeenCalledTimes(1);
      expect(FARM_NFT_ITEM_REVISION.createUnstakeBody).toHaveBeenCalledWith(
        farmNFT,
        {},
      );

      expect(params.to).toEqual(new Address(FARM_NFT_ITEM_ADDRESS));
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEwAAACJjcmVhdGVVbnN0YWtlQm9kee6ehAo="',
      );
      expect(params.gasAmount).toEqual(
        FARM_NFT_ITEM_REVISION.gasConstants.unstake,
      );
    });
    it('should build expected params when gasAmount is defined', async () => {
      const farmNFT = new FarmNftItem(PROVIDER, {
        revision: FARM_NFT_ITEM_REVISION,
        address: FARM_NFT_ITEM_ADDRESS,
      });

      const gasAmount = new BN(123);
      const txParams = await farmNFT.buildUnstakeTxParams({
        gasAmount,
      });

      expect(FARM_NFT_ITEM_REVISION.createUnstakeBody).toHaveBeenCalledTimes(1);
      expect(FARM_NFT_ITEM_REVISION.createUnstakeBody).toHaveBeenCalledWith(
        farmNFT,
        {},
      );

      expect(txParams.to).toEqual(new Address(FARM_NFT_ITEM_ADDRESS));
      expect(
        bytesToBase64(await txParams.payload.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEwAAACJjcmVhdGVVbnN0YWtlQm9kee6ehAo="',
      );
      expect(txParams.gasAmount).toEqual(gasAmount);
    });
    it('should build expected params when queryId is defined', async () => {
      const farmNFT = new FarmNftItem(PROVIDER, {
        revision: FARM_NFT_ITEM_REVISION,
        address: FARM_NFT_ITEM_ADDRESS,
      });

      const queryId = 12345;
      const txParams = await farmNFT.buildUnstakeTxParams({
        queryId,
      });

      expect(FARM_NFT_ITEM_REVISION.createUnstakeBody).toHaveBeenCalledTimes(1);
      expect(FARM_NFT_ITEM_REVISION.createUnstakeBody).toHaveBeenCalledWith(
        farmNFT,
        {
          queryId,
        },
      );

      expect(txParams.to).toEqual(new Address(FARM_NFT_ITEM_ADDRESS));
      expect(
        bytesToBase64(await txParams.payload.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEwAAACJjcmVhdGVVbnN0YWtlQm9kee6ehAo="',
      );
      expect(txParams.gasAmount).toEqual(
        FARM_NFT_ITEM_REVISION.gasConstants.unstake,
      );
    });
  });

  describe('buildDestroyTxParams', () => {
    it('should build expected params by using createDestroyBody method', async () => {
      const farmNFT = new FarmNftItem(PROVIDER, {
        revision: FARM_NFT_ITEM_REVISION,
        address: FARM_NFT_ITEM_ADDRESS,
      });

      const txParams = await farmNFT.buildDestroyTxParams();

      expect(FARM_NFT_ITEM_REVISION.createDestroyBody).toHaveBeenCalledTimes(1);
      expect(FARM_NFT_ITEM_REVISION.createDestroyBody).toHaveBeenCalledWith(
        farmNFT,
        {},
      );

      expect(txParams.to).toEqual(new Address(FARM_NFT_ITEM_ADDRESS));
      expect(
        bytesToBase64(await txParams.payload.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEwAAACJjcmVhdGVEZXN0cm95Qm9keS2pAuI="',
      );
      expect(txParams.gasAmount).toEqual(
        FARM_NFT_ITEM_REVISION.gasConstants.destroy,
      );
    });
    it('should build expected params when gasAmount is defined', async () => {
      const farmNFT = new FarmNftItem(PROVIDER, {
        revision: FARM_NFT_ITEM_REVISION,
        address: FARM_NFT_ITEM_ADDRESS,
      });

      const gasAmount = new BN(123);
      const txParams = await farmNFT.buildDestroyTxParams({
        gasAmount,
      });

      expect(FARM_NFT_ITEM_REVISION.createDestroyBody).toHaveBeenCalledTimes(1);
      expect(FARM_NFT_ITEM_REVISION.createDestroyBody).toHaveBeenCalledWith(
        farmNFT,
        {},
      );

      expect(txParams.to).toEqual(new Address(FARM_NFT_ITEM_ADDRESS));
      expect(
        bytesToBase64(await txParams.payload.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEwAAACJjcmVhdGVEZXN0cm95Qm9keS2pAuI="',
      );
      expect(txParams.gasAmount).toEqual(gasAmount);
    });
    it('should build expected params when queryId is defined', async () => {
      const farmNFT = new FarmNftItem(PROVIDER, {
        revision: FARM_NFT_ITEM_REVISION,
        address: FARM_NFT_ITEM_ADDRESS,
      });

      const queryId = 12345;
      const txParams = await farmNFT.buildDestroyTxParams({
        queryId,
      });

      expect(FARM_NFT_ITEM_REVISION.createDestroyBody).toHaveBeenCalledTimes(1);
      expect(FARM_NFT_ITEM_REVISION.createDestroyBody).toHaveBeenCalledWith(
        farmNFT,
        {
          queryId,
        },
      );

      expect(txParams.to).toEqual(new Address(FARM_NFT_ITEM_ADDRESS));
      expect(
        bytesToBase64(await txParams.payload.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEwAAACJjcmVhdGVEZXN0cm95Qm9keS2pAuI="',
      );
      expect(txParams.gasAmount).toEqual(
        FARM_NFT_ITEM_REVISION.gasConstants.destroy,
      );
    });
  });
});
