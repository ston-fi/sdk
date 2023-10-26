import TonWeb from 'tonweb';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { createMockObj } from '@/tests/utils';
import { FARM_REVISION } from '../constants';

import {
  FarmNftMinter,
  PendingData,
  Version,
  type FarmNftMinterData,
} from './FarmNftMinter';
import type { FarmNftMinterRevision } from './FarmNftMinterRevision';

const {
  Address,
  boc: { Cell },
  utils: { BN, bytesToBase64, base64ToBytes },
} = TonWeb;

const PROVIDER = createMockObj<FarmNftMinter['provider']>();
const FARM_MINTER_ADDRESS = 'EQCgKwUFWHhKyUUYBeG1PokxWhAtFyp5VcxU-sMXBrqma80u';
const FARM_MINTER_REVISION = createMockObj<FarmNftMinterRevision>({
  gasConstants: {
    stake: new BN(2),
    stakeForward: new BN(1),
  },
  createStakeBody: vi.fn(() => {
    const cell = new Cell();
    cell.bits.writeString('createStakeBody');

    return cell;
  }),
  getPendingData: vi.fn(() => {
    const makeTestCell = (data: string) => {
      const cell = new Cell();
      cell.bits.writeString('test1');
      return cell;
    };

    const pendingData: PendingData = {
      changeCustodianTs: new BN(1),
      sendMsgTs: new BN(2),
      codeUpgradeTs: new BN(3),
      newCustodian: new Address(
        '0:0ef49b0311b3a39dbf00651cb134788e0e355e02f811da7d374f4bad620929c7',
      ),
      pendingMsg: makeTestCell('test1'),
      newCode: makeTestCell('test2'),
      newStorage: makeTestCell('test3'),
    };

    return pendingData;
  }),
  getVersion: vi.fn(() => {
    const version: Version = {
      major: 2,
      minor: 0,
      development: 'dev',
    };

    return version;
  }),
  getData: vi.fn(() => {
    const data: FarmNftMinterData = {
      nextItemIndex: new BN(1),
      lastUpdateTime: new BN(2),
      status: 3,
      depositedNanorewards: new BN(4),
      currentStakedTokens: new BN(5),
      accruedPerUnitNanorewards: new BN(6),
      claimedFeeNanorewards: new BN('0'),
      accruedFeeNanorewards: new BN('0'),
      accruedNanorewards: new BN(7),
      claimedNanorewards: new BN(8),
      contractUniqueId: new BN(9),
      nanorewardsPer24h: new BN(10),
      adminFee: new BN('0'),
      soulboundItems: true,
      minStakeTime: new BN(11),
      stakingTokenWallet: new Address(
        '0:bbf374716195ceb8a44bebf40b25c3f11de96cda0d78d5b389b6eb268d896ebf',
      ),
      rewardTokenWallet: new Address(
        '0:a164c2c6da9d3bb5879c4e990eaf1d31c5f30667ff74bb277f504f5181997b16',
      ),
      custodianAddress: null,
      canChangeCustodian: false,
      canSendRawMsg: false,
      canChangeFee: false,
      unrestrictedDepositRewards: false,
    };

    return data;
  }),
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('FarmNftMinter', () => {
  describe('constructor', () => {
    it('should build farm NFT minter contract with a custom revision class', () => {
      const revision = createMockObj<FarmNftMinterRevision>({});
      const farmMinter = new FarmNftMinter(PROVIDER, {
        revision,
        address: FARM_MINTER_ADDRESS,
      });

      expect(farmMinter).toBeInstanceOf(FarmNftMinter);
    });
    it('should build farm NFT minter contract with a specific string revision', () => {
      const farmMinter = new FarmNftMinter(PROVIDER, {
        revision: FARM_REVISION.V2,
        address: FARM_MINTER_ADDRESS,
      });

      expect(farmMinter).toBeInstanceOf(FarmNftMinter);
    });
    it('should throw if unknown string revision is provided', () => {
      expect(
        () =>
          new FarmNftMinter(PROVIDER, {
            revision: 'unknown' as any,
            address: FARM_MINTER_ADDRESS,
          }),
      ).toThrow();
    });
  });

  describe('gasConstants', () => {
    it('should return gas constants from revision', () => {
      const farmMinter = new FarmNftMinter(PROVIDER, {
        revision: FARM_MINTER_REVISION,
        address: FARM_MINTER_ADDRESS,
      });

      expect(farmMinter.gasConstants).toBe(FARM_MINTER_REVISION.gasConstants);
    });
  });

  describe('getStakingJettonAddress', () => {
    const provider = createMockObj<FarmNftMinter['provider']>({
      ...PROVIDER,

      call2: vi.fn(() => {
        return [
          new BN('1'),
          Cell.oneFromBoc(
            base64ToBytes(
              'te6ccsEBAQEAJAAAAEOAFCyYWNtTp3aw84nTIdXjpji+YMz/7pdk7+oJ6jAzL2LQaiqkuA==',
            ),
          ),
          Cell.oneFromBoc(
            base64ToBytes(
              'te6ccsEBAQEAJAAAAEOAF35ujiwyudcUiX1+gWS4fiO9LZtBrxq2cTbdZNGxLdfwQ7uV5g==',
            ),
          ),
        ];
      }),
    });

    it('should return gas correct staking jetton address', async () => {
      const farmMinter = new FarmNftMinter(provider, {
        revision: FARM_MINTER_REVISION,
        address: FARM_MINTER_ADDRESS,
      });

      const stakingJettonAddress = await farmMinter.getStakingJettonAddress();

      expect(stakingJettonAddress.toString()).toEqual(
        '0:bbf374716195ceb8a44bebf40b25c3f11de96cda0d78d5b389b6eb268d896ebf',
      );
    });
  });

  describe('createStakeBody', () => {
    it('should call revision.createStakeBody and return expected result', async () => {
      const farmMinter = new FarmNftMinter(PROVIDER, {
        revision: FARM_MINTER_REVISION,
        address: FARM_MINTER_ADDRESS,
      });

      const body = await farmMinter.createStakeBody();

      expect(FARM_MINTER_REVISION.createStakeBody).toHaveBeenCalledTimes(1);
      expect(FARM_MINTER_REVISION.createStakeBody).toHaveBeenCalledWith(
        farmMinter,
      );

      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEQAAAB5jcmVhdGVTdGFrZUJvZHlHgb/v"',
      );
    });
  });

  describe('getPendingData', () => {
    it('should call revision.getPendingData and return expected result', async () => {
      const farmMinter = new FarmNftMinter(PROVIDER, {
        revision: FARM_MINTER_REVISION,
        address: FARM_MINTER_ADDRESS,
      });

      const pendingData = await farmMinter.getPendingData();

      expect(FARM_MINTER_REVISION.getPendingData).toHaveBeenCalledTimes(1);
      expect(FARM_MINTER_REVISION.getPendingData).toHaveBeenCalledWith(
        farmMinter,
      );

      expect(pendingData).toMatchInlineSnapshot(`
        {
          "changeCustodianTs": "01",
          "codeUpgradeTs": "03",
          "newCode": Cell {
            "bits": BitString {
              "array": Uint8Array [
                116,
                101,
                115,
                116,
                49,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ],
              "cursor": 40,
              "length": 1023,
            },
            "isExotic": false,
            "refs": [],
          },
          "newCustodian": Address {
            "hashPart": Uint8Array [
              14,
              244,
              155,
              3,
              17,
              179,
              163,
              157,
              191,
              0,
              101,
              28,
              177,
              52,
              120,
              142,
              14,
              53,
              94,
              2,
              248,
              17,
              218,
              125,
              55,
              79,
              75,
              173,
              98,
              9,
              41,
              199,
            ],
            "isBounceable": false,
            "isTestOnly": false,
            "isUrlSafe": false,
            "isUserFriendly": false,
            "wc": 0,
          },
          "newStorage": Cell {
            "bits": BitString {
              "array": Uint8Array [
                116,
                101,
                115,
                116,
                49,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ],
              "cursor": 40,
              "length": 1023,
            },
            "isExotic": false,
            "refs": [],
          },
          "pendingMsg": Cell {
            "bits": BitString {
              "array": Uint8Array [
                116,
                101,
                115,
                116,
                49,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ],
              "cursor": 40,
              "length": 1023,
            },
            "isExotic": false,
            "refs": [],
          },
          "sendMsgTs": "02",
        }
      `);
    });
  });

  describe('getVersion', () => {
    it('should call revision.getVersion and return expected result', async () => {
      const farmMinter = new FarmNftMinter(PROVIDER, {
        revision: FARM_MINTER_REVISION,
        address: FARM_MINTER_ADDRESS,
      });

      const version = await farmMinter.getVersion();

      expect(FARM_MINTER_REVISION.getVersion).toHaveBeenCalledTimes(1);
      expect(FARM_MINTER_REVISION.getVersion).toHaveBeenCalledWith(farmMinter);

      expect(version).toMatchInlineSnapshot(`
          {
            "development": "dev",
            "major": 2,
            "minor": 0,
          }
        `);
    });
  });

  describe('getData', () => {
    it('should call revision.getData and return expected result', async () => {
      const farmMinter = new FarmNftMinter(PROVIDER, {
        revision: FARM_MINTER_REVISION,
        address: FARM_MINTER_ADDRESS,
      });

      const data = await farmMinter.getData();

      expect(FARM_MINTER_REVISION.getData).toHaveBeenCalledTimes(1);
      expect(FARM_MINTER_REVISION.getData).toHaveBeenCalledWith(farmMinter);

      expect(data).toMatchInlineSnapshot(`
    {
      "accruedFeeNanorewards": "00",
      "accruedNanorewards": "07",
      "accruedPerUnitNanorewards": "06",
      "adminFee": "00",
      "canChangeCustodian": false,
      "canChangeFee": false,
      "canSendRawMsg": false,
      "claimedFeeNanorewards": "00",
      "claimedNanorewards": "08",
      "contractUniqueId": "09",
      "currentStakedTokens": "05",
      "custodianAddress": null,
      "depositedNanorewards": "04",
      "lastUpdateTime": "02",
      "minStakeTime": "0b",
      "nanorewardsPer24h": "0a",
      "nextItemIndex": "01",
      "rewardTokenWallet": Address {
        "hashPart": Uint8Array [
          161,
          100,
          194,
          198,
          218,
          157,
          59,
          181,
          135,
          156,
          78,
          153,
          14,
          175,
          29,
          49,
          197,
          243,
          6,
          103,
          255,
          116,
          187,
          39,
          127,
          80,
          79,
          81,
          129,
          153,
          123,
          22,
        ],
        "isBounceable": false,
        "isTestOnly": false,
        "isUrlSafe": false,
        "isUserFriendly": false,
        "wc": 0,
      },
      "soulboundItems": true,
      "stakingTokenWallet": Address {
        "hashPart": Uint8Array [
          187,
          243,
          116,
          113,
          97,
          149,
          206,
          184,
          164,
          75,
          235,
          244,
          11,
          37,
          195,
          241,
          29,
          233,
          108,
          218,
          13,
          120,
          213,
          179,
          137,
          182,
          235,
          38,
          141,
          137,
          110,
          191,
        ],
        "isBounceable": false,
        "isTestOnly": false,
        "isUrlSafe": false,
        "isUserFriendly": false,
        "wc": 0,
      },
      "status": 3,
      "unrestrictedDepositRewards": false,
    }
  `);
    });
  });

  describe('buildStakeTxParams', () => {
    const userWalletAddress =
      'EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i';
    const jettonAddress = 'EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO';
    const jettonAmount = '100000000';

    const provider = createMockObj<FarmNftMinter['provider']>({
      call2: vi.fn(async (...args) => {
        if (
          args[0] === 'EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO' &&
          args[1] === 'get_wallet_address'
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              'te6ccsEBAQEAJAAAAEOAGyaXRViMUyia8SSYvAjZEadfALyBlug8G5lm16uIzMFQUabizw==',
            ),
          );
        }
      }),
    });

    it('should build expected params by using createStakeBody method', async () => {
      const farmMinter = new FarmNftMinter(provider, {
        revision: FARM_MINTER_REVISION,
        address: FARM_MINTER_ADDRESS,
      });

      const txParams = await farmMinter.buildStakeTxParams({
        userWalletAddress,
        jettonAddress,
        jettonAmount,
      });

      expect(FARM_MINTER_REVISION.createStakeBody).toHaveBeenCalledTimes(1);
      expect(FARM_MINTER_REVISION.createStakeBody).toHaveBeenCalledWith(
        farmMinter,
      );

      expect(txParams.to.toString()).toEqual(
        '0:d934ba2ac4629944d78924c5e046c88d3af805e40cb741e0dccb36bd5c46660a',
      );
      expect(
        bytesToBase64(await txParams.payload.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAgEAaQAAWAGqD4p+pQAAAAAAAAAAQF9eEAgBQFYKCrDwlZKKMAvDan0SYrQgWi5U8quYqfWGLg11TNcABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oCAwEAHmNyZWF0ZVN0YWtlQm9keR+Viww="',
      );
      expect(txParams.gasAmount).toEqual(
        FARM_MINTER_REVISION.gasConstants.stake,
      );
    });
    it('should build expected params when gasAmount is defined', async () => {
      const farmMinter = new FarmNftMinter(provider, {
        revision: FARM_MINTER_REVISION,
        address: FARM_MINTER_ADDRESS,
      });

      const gasAmount = new BN(111111111);

      const txParams = await farmMinter.buildStakeTxParams({
        userWalletAddress,
        jettonAddress,
        jettonAmount,
        gasAmount,
      });

      expect(FARM_MINTER_REVISION.createStakeBody).toHaveBeenCalledTimes(1);
      expect(FARM_MINTER_REVISION.createStakeBody).toHaveBeenCalledWith(
        farmMinter,
      );

      expect(txParams.to.toString()).toEqual(
        '0:d934ba2ac4629944d78924c5e046c88d3af805e40cb741e0dccb36bd5c46660a',
      );
      expect(
        bytesToBase64(await txParams.payload.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAgEAaQAAWAGqD4p+pQAAAAAAAAAAQF9eEAgBQFYKCrDwlZKKMAvDan0SYrQgWi5U8quYqfWGLg11TNcABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oCAwEAHmNyZWF0ZVN0YWtlQm9keR+Viww="',
      );
      expect(txParams.gasAmount).toEqual(gasAmount);
    });
    it('should build expected params when forwardGasAmount is defined', async () => {
      const farmMinter = new FarmNftMinter(provider, {
        revision: FARM_MINTER_REVISION,
        address: FARM_MINTER_ADDRESS,
      });

      const forwardGasAmount = new BN(222222222);

      const txParams = await farmMinter.buildStakeTxParams({
        userWalletAddress,
        jettonAddress,
        jettonAmount,
        forwardGasAmount,
      });

      expect(FARM_MINTER_REVISION.createStakeBody).toHaveBeenCalledTimes(1);
      expect(FARM_MINTER_REVISION.createStakeBody).toHaveBeenCalledWith(
        farmMinter,
      );

      expect(txParams.to.toString()).toEqual(
        '0:d934ba2ac4629944d78924c5e046c88d3af805e40cb741e0dccb36bd5c46660a',
      );
      expect(
        bytesToBase64(await txParams.payload.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAgEAbAAAWwGwD4p+pQAAAAAAAAAAQF9eEAgBQFYKCrDwlZKKMAvDan0SYrQgWi5U8quYqfWGLg11TNcABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oIGn2vHQEAHmNyZWF0ZVN0YWtlQm9keQmmsjs="',
      );
      expect(txParams.gasAmount).toEqual(
        FARM_MINTER_REVISION.gasConstants.stake,
      );
    });
    it('should build expected params when queryId is defined', async () => {
      const farmMinter = new FarmNftMinter(provider, {
        revision: FARM_MINTER_REVISION,
        address: FARM_MINTER_ADDRESS,
      });

      const queryId = new BN(12345);

      const txParams = await farmMinter.buildStakeTxParams({
        userWalletAddress,
        jettonAddress,
        jettonAmount,
        queryId,
      });

      expect(FARM_MINTER_REVISION.createStakeBody).toHaveBeenCalledTimes(1);
      expect(FARM_MINTER_REVISION.createStakeBody).toHaveBeenCalledWith(
        farmMinter,
      );

      expect(txParams.to.toString()).toEqual(
        '0:d934ba2ac4629944d78924c5e046c88d3af805e40cb741e0dccb36bd5c46660a',
      );
      expect(
        bytesToBase64(await txParams.payload.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAgEAaQAAWAGqD4p+pQAAAAAAADA5QF9eEAgBQFYKCrDwlZKKMAvDan0SYrQgWi5U8quYqfWGLg11TNcABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oCAwEAHmNyZWF0ZVN0YWtlQm9kedBP6Q8="',
      );
      expect(txParams.gasAmount).toEqual(
        FARM_MINTER_REVISION.gasConstants.stake,
      );
    });
  });
});
