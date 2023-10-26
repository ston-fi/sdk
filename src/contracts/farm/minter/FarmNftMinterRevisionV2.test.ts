import TonWeb from 'tonweb';
import { describe, it, expect, vi } from 'vitest';

import { createMockObj } from '@/tests/utils';

import { FarmNftMinter } from './FarmNftMinter';
import { FarmNftMinterRevisionV2 } from './FarmNftMinterRevisionV2';

const {
  utils: { BN, bytesToBase64, base64ToBytes },
  boc: { Cell },
  Address,
} = TonWeb;

const FARM_MINTER_ADDRESS = 'EQBK6Y90pyUTXxB6OR0MDkNl3yi7b_4ChKUo6jh0QkGXMqF9';
const FARM_MINTER = createMockObj<FarmNftMinter>({
  getAddress: vi.fn(() => new Address(FARM_MINTER_ADDRESS)),
});

describe('FarmNftMinterRevisionV2', () => {
  describe('gasConstants', () => {
    it('should return expected gas constants', () => {
      const { gasConstants } = new FarmNftMinterRevisionV2();

      expect(gasConstants.stake).toEqual(new BN(300000000));
      expect(gasConstants.stakeForward).toEqual(new BN(250000000));
    });
  });

  describe('createStakeBody', () => {
    it('should create body with expected content', async () => {
      const farmMinter = FARM_MINTER;
      const revision = new FarmNftMinterRevisionV2();

      const body = await revision.createStakeBody(farmMinter);

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEABgAAAAhuydxlxBqEvg=="',
      );
    });
  });

  describe('getPendingData', () => {
    const provider = createMockObj<FarmNftMinter['provider']>({
      call2: vi
        .fn()
        .mockResolvedValue([
          new BN('1'),
          new BN('2'),
          new BN('3'),
          Cell.oneFromBoc(
            base64ToBytes(
              'te6ccsEBAQEAJAAAAEOAAd6TYGI2dHO34AyjliaPEcHGq8BfAjtPpunpdaxBJTjwb9ml9Q==',
            ),
          ),
          Cell.oneFromBoc(base64ToBytes('te6ccsEBAQEABwAAAAp0ZXN0MfLyp7w=')),
          Cell.oneFromBoc(base64ToBytes('te6ccsEBAQEABwAAAAp0ZXN0MgYB968=')),
          Cell.oneFromBoc(base64ToBytes('te6ccsEBAQEABwAAAAp0ZXN0MwWCnF0=')),
        ]),
    });

    it('should return expected prending data', async () => {
      const farmMinter = createMockObj<FarmNftMinter>({
        ...FARM_MINTER,
        provider: {
          ...FARM_MINTER.provider,
          ...provider,
        },
      });

      const revision = new FarmNftMinterRevisionV2();

      const pendingData = await revision.getPendingData(farmMinter);

      expect(farmMinter.provider.call2).toHaveBeenCalledTimes(1);
      expect(farmMinter.provider.call2).toHaveBeenCalledWith(
        FARM_MINTER_ADDRESS,
        'get_pending_data',
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
                    50,
                  ],
                  "cursor": 40,
                  "length": 40,
                },
                "isExotic": 0,
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
                    51,
                  ],
                  "cursor": 40,
                  "length": 40,
                },
                "isExotic": 0,
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
                  ],
                  "cursor": 40,
                  "length": 40,
                },
                "isExotic": 0,
                "refs": [],
              },
              "sendMsgTs": "02",
            }
          `);
    });
  });

  describe('getVersion', () => {
    const provider = createMockObj<FarmNftMinter['provider']>({
      call2: vi
        .fn()
        .mockResolvedValue([
          new BN('2'),
          new BN('0'),
          Cell.oneFromBoc(base64ToBytes('te6ccsEBAQEABQAAAAZkZXbuxAP/')),
        ]),
    });

    it('should return expected version', async () => {
      const farmMinter = createMockObj<FarmNftMinter>({
        ...FARM_MINTER,
        provider: {
          ...FARM_MINTER.provider,
          ...provider,
        },
      });

      const revision = new FarmNftMinterRevisionV2();

      const version = await revision.getVersion(farmMinter);

      expect(farmMinter.provider.call2).toHaveBeenCalledTimes(1);
      expect(farmMinter.provider.call2).toHaveBeenCalledWith(
        FARM_MINTER_ADDRESS,
        'get_version',
      );

      expect(version).toMatchInlineSnapshot(`
      {
        "development": "dev",
        "major": "02",
        "minor": "00",
      }
    `);
    });
  });

  describe('getData', () => {
    const provider = createMockObj<FarmNftMinter['provider']>({
      call2: vi
        .fn()
        .mockResolvedValue([
          new BN('999'),
          new BN('1695497041'),
          new BN('3'),
          new BN('30000000000000000000000'),
          new BN('7961105208'),
          new BN('539726098095'),
          new BN('1365866000000000'),
          new BN('8064655555555552'),
          new BN('29999999999958353284279'),
          new BN('29619051677843000000000'),
          new BN('2072561916'),
          new BN('666666666666000000000'),
          new BN('1000'),
          new BN('1209600'),
          Cell.oneFromBoc(
            base64ToBytes(
              'te6ccsEBAQEAJAAAAEOAF35ujiwyudcUiX1+gWS4fiO9LZtBrxq2cTbdZNGxLdfwQ7uV5g==',
            ),
          ),
          Cell.oneFromBoc(
            base64ToBytes(
              'te6ccsEBAQEAJAAAAEOAFCyYWNtTp3aw84nTIdXjpji+YMz/7pdk7+oJ6jAzL2LQaiqkuA==',
            ),
          ),
          Cell.oneFromBoc(
            base64ToBytes(
              'te6ccsEBAQEAJAAAAEOAAd6TYGI2dHO34AyjliaPEcHGq8BfAjtPpunpdaxBJTjwb9ml9Q==',
            ),
          ),
          new BN('-1'),
          new BN('-1'),
          new BN('-1'),
          new BN('-1'),
          new BN('-1'),
        ]),
    });

    it('should return expected data about the minter', async () => {
      const farmMinter = createMockObj<FarmNftMinter>({
        ...FARM_MINTER,
        provider: {
          ...FARM_MINTER.provider,
          ...provider,
        },
      });

      const revision = new FarmNftMinterRevisionV2();

      const data = await revision.getData(farmMinter);

      expect(farmMinter.provider.call2).toHaveBeenCalledTimes(1);
      expect(farmMinter.provider.call2).toHaveBeenCalledWith(
        FARM_MINTER_ADDRESS,
        'get_farming_minter_data',
      );

      expect(data).toMatchInlineSnapshot(`
            {
              "accruedFeeNanorewards": "1ca6c2f19ff0e0",
              "accruedNanorewards": "065a4da25d2664698cb7",
              "accruedPerUnitNanorewards": "7daa2eaeaf",
              "adminFee": "03e8",
              "canChangeCustodian": true,
              "canChangeFee": true,
              "canSendRawMsg": true,
              "claimedFeeNanorewards": "04da3f75bda400",
              "claimedNanorewards": "0645a6ea0c8969b1fe00",
              "contractUniqueId": "7b88c8fc",
              "currentStakedTokens": "01da84d338",
              "custodianAddress": Address {
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
              "depositedNanorewards": "065a4da25d3016c00000",
              "lastUpdateTime": "650f3b51",
              "minStakeTime": "127500",
              "nanorewardsPer24h": "2423dbc92e6cae2400",
              "nextItemIndex": "03e7",
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
              "status": "03",
              "unrestrictedDepositRewards": true,
            }
          `);
    });
  });
});
