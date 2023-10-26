import TonWeb from 'tonweb';
import { describe, it, expect, vi } from 'vitest';

import { createMockObj } from '@/tests/utils';

import type { FarmNftItem } from './FarmNftItem';
import { FarmNftItemRevisionV2 } from './FarmNftItemRevisionV2';

const {
  utils: { BN, bytesToBase64 },
  boc: { Cell },
  Address,
} = TonWeb;

const FARM_NFT_ITEM_ADDRESS =
  'EQB1F8VDBrJshQklOMTmKGWkZcBDrVwgr5MU5FeOL7noigrT';
const FARM_NFT = createMockObj<FarmNftItem>({
  getAddress: vi.fn(() => new Address(FARM_NFT_ITEM_ADDRESS)),
});

describe('FarmNftItemRevisionV2', () => {
  describe('gasConstants', () => {
    it('should return expected gas constants', () => {
      const { gasConstants } = new FarmNftItemRevisionV2();

      expect(gasConstants.claimRewards).toEqual(new BN('300000000'));
      expect(gasConstants.unstake).toEqual(new BN('400000000'));
      expect(gasConstants.destroy).toEqual(new BN('50000000'));
    });
  });

  describe('createClaimRewardsBody', () => {
    it('should create body with expected content', async () => {
      const farmNftItem = FARM_NFT;
      const revision = new FarmNftItemRevisionV2();

      const body = await revision.createClaimRewardsBody(farmNftItem, {});

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABh42fEJAAAAAAAAAAAlRup5"',
      );
    });
    it('should create body with expected content when queryId is defined', async () => {
      const farmNftItem = FARM_NFT;
      const revision = new FarmNftItemRevisionV2();

      const body = await revision.createClaimRewardsBody(farmNftItem, {
        queryId: 123456789,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABh42fEJAAAAAAdbzRWXKBXk"',
      );
    });
  });

  describe('createUnstakeBody', () => {
    it('should create body with expected content', async () => {
      const farmNftItem = FARM_NFT;
      const revision = new FarmNftItemRevisionV2();

      const body = await revision.createUnstakeBody(farmNftItem, {});

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABi5KWWgAAAAAAAAAACwvsVD"',
      );
    });
    it('should create body with expected content when queryId is defined', async () => {
      const farmNftItem = FARM_NFT;
      const revision = new FarmNftItemRevisionV2();

      const body = await revision.createUnstakeBody(farmNftItem, {
        queryId: 123456789,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABi5KWWgAAAAAAdbzRUC0Dre"',
      );
    });
  });

  describe('createDestroyBody', () => {
    it('should create body with expected content', async () => {
      const farmNftItem = FARM_NFT;
      const revision = new FarmNftItemRevisionV2();

      const body = await revision.createDestroyBody(farmNftItem, {});

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgfBFN6AAAAAAAAAAAxk9G9"',
      );
    });
    it('should create body with expected content when queryId is defined', async () => {
      const farmNftItem = FARM_NFT;
      const revision = new FarmNftItemRevisionV2();

      const body = await revision.createDestroyBody(farmNftItem, {
        queryId: 123456789,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgfBFN6AAAAAAdbzRWD/S4g"',
      );
    });
  });

  describe('getFarmingData', async () => {
    it('should return expected data about the NFT', async () => {
      const farmNftItem = createMockObj<FarmNftItem>({
        ...FARM_NFT,
        provider: {
          ...FARM_NFT.provider,
          call2: vi
            .fn()
            .mockResolvedValue([
              new BN('1'),
              new BN('1698161152'),
              new BN('2000'),
              new BN('3427367800944'),
              new BN('1693329773'),
            ]),
        },
      });

      const revision = new FarmNftItemRevisionV2();

      const data = await revision.getFarmingData(farmNftItem);

      expect(farmNftItem.provider.call2).toBeCalledTimes(1);
      expect(farmNftItem.provider.call2).toBeCalledWith(
        FARM_NFT_ITEM_ADDRESS,
        'get_farming_data',
      );

      expect(data).toMatchInlineSnapshot(`
              {
                "claimedPerUnitNanorewards": "031dff0a5070",
                "isSoulbound": true,
                "revokeTime": "6537e200",
                "stakeDate": "64ee296d",
                "stakedTokens": "07d0",
                "status": "01",
              }
            `);
    });
  });
});
