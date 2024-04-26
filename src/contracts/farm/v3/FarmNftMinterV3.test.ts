import TonWeb from "tonweb";
import { describe, it, expect, vi } from "vitest";

import { createMockObj } from "@/test-utils";

import { FARM_VERSION } from "../constants";

import { FarmNftMinterV3 } from "./FarmNftMinterV3";

const {
  utils: { BN, bytesToBase64, base64ToBytes },
  boc: { Cell },
  Address,
} = TonWeb;

const TON_API_CLIENT =
  createMockObj<InstanceType<typeof TonWeb.HttpProvider>>();
const DEPENDENCIES = {
  tonApiClient: TON_API_CLIENT,
  address: "EQCp5szP3mCqAY11tzhdo7RElDzilThbPuzUF2zTeyYG5Vyz",
};

describe("FarmNftMinterV3", () => {
  describe("version", () => {
    it("should have expected static value", () => {
      expect(FarmNftMinterV3.version).toBe(FARM_VERSION.v3);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(FarmNftMinterV3.gasConstants).toMatchInlineSnapshot(
        `
        {
          "stake": "05f5e100",
          "stakeFwdBase": "0c845880",
          "stakeFwdPerPool": "e4e1c0",
        }
      `,
      );
    });
  });

  describe("constructor", () => {
    it("should create an instance of FarmNftMinterV3", () => {
      const contract = new FarmNftMinterV3({
        ...DEPENDENCIES,
      });

      expect(contract).toBeInstanceOf(FarmNftMinterV3);
    });

    it("should create an instance of FarmNftMinterV3 with default gasConstants", () => {
      const contract = new FarmNftMinterV3({
        ...DEPENDENCIES,
      });

      expect(contract.gasConstants).toEqual(FarmNftMinterV3.gasConstants);
    });

    it("should create an instance of FarmNftMinterV3 with given gasConstants", () => {
      const gasConstants: Partial<FarmNftMinterV3["gasConstants"]> = {
        stake: new BN("1"),
      };

      const contract = new FarmNftMinterV3({
        ...DEPENDENCIES,
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createStakeBody", () => {
    it("should build expected tx body", async () => {
      const contract = new FarmNftMinterV3({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const payload = await contract.createStakeBody();

      expect(payload).toBeInstanceOf(Cell);
      expect(bytesToBase64(await payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEABwAAAAluydxlIPL4D1I="',
      );
    });

    it("should build expected tx body when ownerAddress is defined", async () => {
      const contract = new FarmNftMinterV3({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const payload = await contract.createStakeBody({
        ownerAddress: "EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i",
      });

      expect(payload).toBeInstanceOf(Cell);
      expect(bytesToBase64(await payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAKAAAAEtuydxlgAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEG6Xb98="',
      );
    });
  });

  describe("buildStakeTxParams", () => {
    const txArguments = {
      userWalletAddress: "EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i",
      jettonAddress: "EQDtZHOtVWaf9UIU6rmjLPNLTGxNLNogvK5xUZlMRgZwQ4Gt",
      jettonAmount: "1000000000",
      poolCount: 1,
    };

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn(async (...args) => {
        if (
          args[0] === txArguments.jettonAddress &&
          args[1] === "get_wallet_address"
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              "te6ccsEBAQEAJAAAAEOAHFQxcq1rJvR/WddZfRdbC3/v2+tY+uTSBzqdnLahlpIwAkKqkA==",
            ),
          );
        }

        throw new Error(`Unexpected call2: ${args}`);
      }),
    });

    it("sshould build expected tx params", async () => {
      const contract = new FarmNftMinterV3({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const messageData = await contract.buildStakeTxParams({
        ...txArguments,
      });

      expect(messageData.to.toString()).toMatchInlineSnapshot(
        '"EQDioYuVa1k3o_rOusvouthb_37fWsfXJpA51OzltQy0kY_K"',
      );
      expect(
        bytesToBase64(await messageData.payload.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAgEAYgAAWwGwD4p+pQAAAAAAAAAAQ7msoAgBU82Zn7zBVAMa625wu0doiSh5xSpwtn3ZqC7ZpvZMDcsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oIHJw4AQEACW7J3GUghMNV2Q=="',
      );
      expect(messageData.gasAmount).toEqual(new BN(340000000));
    });

    it("should build expected tx params when ownerAddress is defined", async () => {
      const contract = new FarmNftMinterV3({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const messageData = await contract.buildStakeTxParams({
        ...txArguments,
        ownerAddress: "EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i",
      });

      expect(messageData.to.toString()).toMatchInlineSnapshot(
        '"EQDioYuVa1k3o_rOusvouthb_37fWsfXJpA51OzltQy0kY_K"',
      );
      expect(
        bytesToBase64(await messageData.payload.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAgEAgwAAWwGwD4p+pQAAAAAAAAAAQ7msoAgBU82Zn7zBVAMa625wu0doiSh5xSpwtn3ZqC7ZpvZMDcsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oIHJw4AQEAS27J3GWAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QzvKC+Q=="',
      );
      expect(messageData.gasAmount).toEqual(new BN(340000000));
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new FarmNftMinterV3({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const messageData = await contract.buildStakeTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(messageData.to.toString()).toMatchInlineSnapshot(
        '"EQDioYuVa1k3o_rOusvouthb_37fWsfXJpA51OzltQy0kY_K"',
      );
      expect(
        bytesToBase64(await messageData.payload.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAgEAYgAAWwGwD4p+pQAAAAAAADA5Q7msoAgBU82Zn7zBVAMa625wu0doiSh5xSpwtn3ZqC7ZpvZMDcsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oIHJw4AQEACW7J3GUgYlbNLA=="',
      );
      expect(messageData.gasAmount).toEqual(new BN(340000000));
    });

    it("gasAmount should be different based on poolCount", async () => {
      const poolsToGasMap = [
        [1, new BN("340000000")],
        [2, new BN("355000000")],
        [3, new BN("370000000")],
      ] as const;

      const contract = new FarmNftMinterV3({
        ...DEPENDENCIES,
        tonApiClient,
      });

      expect(
        await Promise.all(
          poolsToGasMap.map(async ([poolCount]) => {
            const messageData = await contract.buildStakeTxParams({
              ...txArguments,
              poolCount,
            });

            return messageData.gasAmount;
          }),
        ),
      ).toEqual(poolsToGasMap.map(([_, gasAmount]) => gasAmount));
    });
  });

  describe("getData", () => {
    const snapshot = [
      new BN("2259"),
      new BN("1"),
      new BN("3"),
      new BN("248359521312"),
      new BN("103037229"),
      new BN("864000"),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsEBAQEAJAAAAEOAB6QiQ0T/22/J+dCm9MMTbVU4qD4ojxQrph7+3gjW7q+QCf49AQ==",
        ),
      ),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsEBAQEAJAAAAEOAE1XEnRcjRVi9UD7WrYvKkVyYXqugt8gbjnnHwqvEhL6wioVD+g==",
        ),
      ),
      new BN("-1"),
      new BN("-1"),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsECCAEAAYcAAAAABQAKAA4AiQCNAQgBDAIBzQEGAgEgAgQBASADAPEAAAAAAAAAAAA23yPjcpaKGoAAAAAAAAAAAAAAAAAAAAPuFyutcAAAAAAAAAAAAqExE+k7MX4/iMAAAAAAAAAAAAe2FsLOQZKqRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZik3ToAQEgBQDxAAAAAAAAAAAAKloFj8KV7QAAAAAAAAAAAAAAAAAAAAADCIg3IIAAAAAAAAAAAAIHlyQrccQTlPJAAAAAAAAAAAAF86nbNP1sAeYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGYpN06AEBSAcA8QAAAAAAAAAAAAh4Z4NLTALKgAAAAAAAAAAAAAAAAAAAAHePkTPAAAAAAAAAAAAAV/Q9o73v1EmfwAAAAAAAAAAAAODc/cNWk3SaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmKTdOh6Xm5I",
        ),
      ),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsEBCAEAxAAABQoOSEyGigIBzQEGAgEgAgQBASADAG8AAAAAAAAAAAAAAAHUPO36EjkQkAMAOevgarWLP/P2hL1ntIUBWX6WSBO92ecxt2sYIVc5dj5gIgEBIAUAbwAAAAAAAAAAAAAAAWlmldvRLTiQAwAcvewmHxjAY9t6LA5qs8aaoI2mVS+xBDKNyAvJWZOSGiAiAQFIBwBvAAAAAAAAAAAAAAAAbMlsqFVJlJADAAifWbxZ3ejqWZqGvBoCj7QafH5DzTJGXkbhA09Ad3ViICJCsQ3c",
        ),
      ),
    ];

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn().mockResolvedValue(snapshot),
    });

    it("should return data about the farm NFT contract state", async () => {
      const farmNftMinter = new FarmNftMinterV3({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const farmingData = await farmNftMinter.getData();

      expect(farmingData).toMatchInlineSnapshot(`
        {
          "canChangeCustodian": true,
          "canSendRawMsg": true,
          "contractUniqueId": "0624392d",
          "currentStakedTokens": "39d3618c20",
          "custodianAddress": Address {
            "hashPart": Uint8Array [
              154,
              174,
              36,
              232,
              185,
              26,
              42,
              197,
              234,
              129,
              246,
              181,
              108,
              94,
              84,
              138,
              228,
              194,
              245,
              93,
              5,
              190,
              64,
              220,
              115,
              206,
              62,
              21,
              94,
              36,
              37,
              245,
            ],
            "isBounceable": false,
            "isTestOnly": false,
            "isUrlSafe": false,
            "isUserFriendly": false,
            "wc": 0,
          },
          "farmDataAccrued": Map {
            0 => {
              "accruedFeeNanorewards": "0a84c44fa4ecc5f8fe23",
              "accruedNanorewards": "00",
              "accruedPerUnitNanorewards": "3ee172bad7",
              "claimedFeeNanorewards": "00",
              "claimedNanorewards": "07b616c2ce4192aa4400",
              "depositedNanorewards": "0db7c8f8dca5a286a000",
              "lastUpdateTime": "6629374e",
            },
            1 => {
              "accruedFeeNanorewards": "081e5c90adc7104e53c9",
              "accruedNanorewards": "00",
              "accruedPerUnitNanorewards": "3088837208",
              "claimedFeeNanorewards": "00",
              "claimedNanorewards": "05f3a9db34fd6c01e600",
              "depositedNanorewards": "0a968163f0a57b400000",
              "lastUpdateTime": "6629374e",
            },
            2 => {
              "accruedFeeNanorewards": "015fd0f68ef7bf51267f",
              "accruedNanorewards": "00",
              "accruedPerUnitNanorewards": "0778f9133c",
              "claimedFeeNanorewards": "00",
              "claimedNanorewards": "e0dcfdc35693749a00",
              "depositedNanorewards": "021e19e0d2d300b2a000",
              "lastUpdateTime": "6629374e",
            },
          },
          "farmDataParameters": Map {
            0 => {
              "adminFee": "00",
              "canChangeFee": true,
              "nanorewardsPer24h": "750f3b7e848e442400",
              "rewardTokenWallet": Address {
                "hashPart": Uint8Array [
                  231,
                  175,
                  129,
                  170,
                  214,
                  44,
                  255,
                  207,
                  218,
                  18,
                  245,
                  158,
                  210,
                  20,
                  5,
                  101,
                  250,
                  89,
                  32,
                  78,
                  247,
                  103,
                  156,
                  198,
                  221,
                  172,
                  96,
                  133,
                  92,
                  229,
                  216,
                  249,
                ],
                "isBounceable": false,
                "isTestOnly": false,
                "isUrlSafe": false,
                "isUserFriendly": false,
                "wc": 0,
              },
              "status": 1,
              "unrestrictedDepositRewards": true,
            },
            1 => {
              "adminFee": "00",
              "canChangeFee": true,
              "nanorewardsPer24h": "5a59a576f44b4e2400",
              "rewardTokenWallet": Address {
                "hashPart": Uint8Array [
                  114,
                  247,
                  176,
                  152,
                  124,
                  99,
                  1,
                  143,
                  109,
                  232,
                  176,
                  57,
                  170,
                  207,
                  26,
                  106,
                  130,
                  54,
                  153,
                  84,
                  190,
                  196,
                  16,
                  202,
                  55,
                  32,
                  47,
                  37,
                  102,
                  78,
                  72,
                  104,
                ],
                "isBounceable": false,
                "isTestOnly": false,
                "isUrlSafe": false,
                "isUserFriendly": false,
                "wc": 0,
              },
              "status": 1,
              "unrestrictedDepositRewards": true,
            },
            2 => {
              "adminFee": "00",
              "canChangeFee": true,
              "nanorewardsPer24h": "1b325b2a1552652400",
              "rewardTokenWallet": Address {
                "hashPart": Uint8Array [
                  34,
                  125,
                  102,
                  241,
                  103,
                  119,
                  163,
                  169,
                  102,
                  106,
                  26,
                  240,
                  104,
                  10,
                  62,
                  208,
                  105,
                  241,
                  249,
                  15,
                  52,
                  201,
                  25,
                  121,
                  27,
                  132,
                  13,
                  61,
                  1,
                  221,
                  213,
                  136,
                ],
                "isBounceable": false,
                "isTestOnly": false,
                "isUrlSafe": false,
                "isUserFriendly": false,
                "wc": 0,
              },
              "status": 1,
              "unrestrictedDepositRewards": true,
            },
          },
          "minStakeTime": "0d2f00",
          "nextItemIndex": "08d3",
          "poolCount": 3,
          "stakingTokenWallet": Address {
            "hashPart": Uint8Array [
              61,
              33,
              18,
              26,
              39,
              254,
              219,
              126,
              79,
              206,
              133,
              55,
              166,
              24,
              155,
              106,
              169,
              197,
              65,
              241,
              68,
              120,
              161,
              93,
              48,
              247,
              246,
              240,
              70,
              183,
              117,
              124,
            ],
            "isBounceable": false,
            "isTestOnly": false,
            "isUrlSafe": false,
            "isUserFriendly": false,
            "wc": 0,
          },
          "status": 1,
        }
      `);
    });
  });
});
