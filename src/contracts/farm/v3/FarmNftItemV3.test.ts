import TonWeb from "tonweb";
import { describe, it, expect, vi } from "vitest";

import { createMockObj } from "@/test-utils";

import { FARM_VERSION } from "../constants";

import { FarmNftItemV3 } from "./FarmNftItemV3";

const {
  utils: { BN, bytesToBase64, base64ToBytes },
  boc: { Cell },
  Address,
} = TonWeb;

const TON_API_CLIENT =
  createMockObj<InstanceType<typeof TonWeb.HttpProvider>>();
const DEPENDENCIES = {
  tonApiClient: TON_API_CLIENT,
  address: "EQAjwDPonic2Rbzqvrd0v5SEnvsZ1FoRRj2dFDVxMLVCUr62",
};

describe("FarmNftItemV3", () => {
  describe("version", () => {
    it("should have expected static value", () => {
      expect(FarmNftItemV3.version).toBe(FARM_VERSION.v3);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(FarmNftItemV3.gasConstants).toMatchInlineSnapshot(
        `
        {
          "claimRewardsBase": "14dc9380",
          "claimRewardsPerPool": "07bfa480",
          "destroy": "02faf080",
          "unstakeBase": "1ad27480",
          "unstakePerPool": "07bfa480",
        }
      `,
      );
    });
  });

  describe("constructor", () => {
    it("should create an instance of FarmNftItemV3", () => {
      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      expect(contract).toBeInstanceOf(FarmNftItemV3);
    });

    it("should create an instance of FarmNftItemV3 with default gasConstants", () => {
      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      expect(contract.gasConstants).toEqual(FarmNftItemV3.gasConstants);
    });

    it("should create an instance of FarmNftItemV3 with given gasConstants", () => {
      const gasConstants: Partial<FarmNftItemV3["gasConstants"]> = {
        claimRewardsBase: new BN("123"),
      };

      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createClaimRewardsBody", () => {
    it("should build expected tx body for claim from all pools", async () => {
      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const payload = await contract.createClaimRewardsBody({
        claimAll: true,
      });

      expect(payload).toBeInstanceOf(Cell);
      expect(bytesToBase64(await payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEAAAABt42fEJAAAAAAAAAACAQCQX+Fc="',
      );
    });

    it("should build expected tx body for claim from a specific pool", async () => {
      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const payload = await contract.createClaimRewardsBody({
        claimAll: false,
        poolIndex: 0,
      });

      expect(payload).toBeInstanceOf(Cell);
      expect(bytesToBase64(await payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEAAAABt42fEJAAAAAAAAAAAAQN3tO6w="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const payload = await contract.createClaimRewardsBody({
        queryId: 12345,
        claimAll: true,
      });

      expect(payload).toBeInstanceOf(Cell);
      expect(bytesToBase64(await payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEAAAABt42fEJAAAAAAAAMDmAQLeYT2U="',
      );
    });
  });

  describe("buildClaimRewardsTxParams", () => {
    const txArguments = {
      poolCount: 1,
    };

    it("should build expected tx params for claim from all pools", async () => {
      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      const messageData = await contract.buildClaimRewardsTxParams({
        ...txArguments,
      });

      expect(messageData.to).toEqual(new Address(DEPENDENCIES.address));
      expect(
        bytesToBase64(await messageData.payload.toBoc()),
      ).toMatchInlineSnapshot('"te6ccsEBAQEAEAAAABt42fEJAAAAAAAAAACAQCQX+Fc="');
      expect(messageData.gasAmount).toEqual(new BN("350000000"));
    });

    it("should build expected tx params for claim from a specific pool", async () => {
      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      const messageData = await contract.buildClaimRewardsTxParams({
        ...txArguments,
        poolCount: 2,
        poolIndex: 1,
      });

      expect(messageData.to).toEqual(new Address(DEPENDENCIES.address));
      expect(
        bytesToBase64(await messageData.payload.toBoc()),
      ).toMatchInlineSnapshot('"te6ccsEBAQEAEAAAABt42fEJAAAAAAAAAAAAwKXWzS4="');
      expect(messageData.gasAmount).toEqual(new BN("480000000"));
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      const messageData = await contract.buildClaimRewardsTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(messageData.to).toEqual(new Address(DEPENDENCIES.address));
      expect(
        bytesToBase64(await messageData.payload.toBoc()),
      ).toMatchInlineSnapshot('"te6ccsEBAQEAEAAAABt42fEJAAAAAAAAMDmAQLeYT2U="');
      expect(messageData.gasAmount).toEqual(new BN("350000000"));
    });

    it("gasAmount should be different based on poolCount", async () => {
      const poolsToGasMap = [
        [1, new BN("350000000")],
        [2, new BN("480000000")],
        [3, new BN("610000000")],
      ] as const;

      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      expect(
        await Promise.all(
          poolsToGasMap.map(async ([poolCount]) => {
            const messageData = await contract.buildClaimRewardsTxParams({
              ...txArguments,
              poolCount,
            });

            return messageData.gasAmount;
          }),
        ),
      ).toEqual(poolsToGasMap.map(([_, gasAmount]) => gasAmount));
    });
  });

  describe("createUnstakeBody", () => {
    it("should create payload for the `unstake` transaction", async () => {
      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const payload = await contract.createUnstakeBody();

      expect(payload).toBeInstanceOf(Cell);
      expect(bytesToBase64(await payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABi5KWWgAAAAAAAAAACwvsVD"',
      );
    });

    it("should create payload for the `unstake` transaction with queryId", async () => {
      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const payload = await contract.createUnstakeBody({
        queryId: 12345,
      });

      expect(payload).toBeInstanceOf(Cell);
      expect(bytesToBase64(await payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABi5KWWgAAAAAAAAMDlOPtpL"',
      );
    });
  });

  describe("buildUnstakeTxParams", () => {
    const txArguments = {
      poolCount: 1,
    };

    it("should build expected tx params", async () => {
      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      const messageData = await contract.buildUnstakeTxParams({
        ...txArguments,
      });

      expect(messageData.to).toEqual(new Address(DEPENDENCIES.address));
      expect(
        bytesToBase64(await messageData.payload.toBoc()),
      ).toMatchInlineSnapshot('"te6ccsEBAQEADgAAABi5KWWgAAAAAAAAAACwvsVD"');
      expect(messageData.gasAmount).toEqual(new BN("450000000"));
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      const messageData = await contract.buildUnstakeTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(messageData.to).toEqual(new Address(DEPENDENCIES.address));
      expect(
        bytesToBase64(await messageData.payload.toBoc()),
      ).toMatchInlineSnapshot('"te6ccsEBAQEADgAAABi5KWWgAAAAAAAAMDlOPtpL"');
      expect(messageData.gasAmount).toEqual(new BN("450000000"));
    });

    it("gasAmount should be different based on poolCount", async () => {
      const poolsToGasMap = [
        [1, new BN("450000000")],
        [2, new BN("580000000")],
        [3, new BN("710000000")],
      ] as const;

      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      expect(
        await Promise.all(
          poolsToGasMap.map(async ([poolCount]) => {
            const messageData = await contract.buildUnstakeTxParams({
              ...txArguments,
              poolCount,
            });

            return messageData.gasAmount;
          }),
        ),
      ).toEqual(poolsToGasMap.map(([_, gasAmount]) => gasAmount));
    });
  });

  describe("createDestroyBody", () => {
    it("should build expected tx body", async () => {
      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const payload = await contract.createDestroyBody();

      expect(payload).toBeInstanceOf(Cell);
      expect(bytesToBase64(await payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgfBFN6AAAAAAAAAAAxk9G9"',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const payload = await contract.createDestroyBody({
        queryId: 12345,
      });

      expect(payload).toBeInstanceOf(Cell);
      expect(bytesToBase64(await payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgfBFN6AAAAAAAAMDnPE861"',
      );
    });
  });

  describe("buildDestroyTxParams", () => {
    it("should build expected tx params", async () => {
      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      const messageData = await contract.buildDestroyTxParams();

      expect(messageData.to).toEqual(new Address(DEPENDENCIES.address));
      expect(
        bytesToBase64(await messageData.payload.toBoc()),
      ).toMatchInlineSnapshot('"te6ccsEBAQEADgAAABgfBFN6AAAAAAAAAAAxk9G9"');
      expect(messageData.gasAmount).toEqual(new BN("50000000"));
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
      });

      const messageData = await contract.buildDestroyTxParams({
        queryId: 12345,
      });

      expect(messageData.to).toEqual(new Address(DEPENDENCIES.address));
      expect(
        bytesToBase64(await messageData.payload.toBoc()),
      ).toMatchInlineSnapshot('"te6ccsEBAQEADgAAABgfBFN6AAAAAAAAMDnPE861"');
      expect(messageData.gasAmount).toEqual(new BN("50000000"));
    });
  });

  describe("getFarmingData", () => {
    const snapshot = [
      new BN("1"),
      new BN("0"),
      new BN("57093"),
      new BN("1712000198"),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsEBBQEASgAABQofNAIBzQEEAgEgAgMAJgAAAAAAAAAAAAAAAAAAB+tvFgsAJgAAAAAAAAAAAAAAAAAABhzWPD8AJ0AAAAAAAAAAAAAAAAAAACce9JsgTlOb7Q==",
        ),
      ),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsEBAQEAJAAAAEOAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QY+4g6g==",
        ),
      ),
    ];

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn().mockResolvedValue(snapshot),
    });

    it("should return data about the farm NFT contract state", async () => {
      const farmNftItem = new FarmNftItemV3({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const data = await farmNftItem.getFarmingData();

      expect(data).toMatchInlineSnapshot(`
        {
          "claimedPerUnit": Map {
            0 => "07eb6f160b",
            1 => "061cd63c3f",
            2 => "9c7bd26c",
          },
          "ownerAddress": Address {
            "hashPart": Uint8Array [
              16,
              159,
              18,
              234,
              149,
              125,
              129,
              235,
              14,
              35,
              67,
              60,
              243,
              61,
              96,
              60,
              123,
              37,
              153,
              85,
              144,
              115,
              233,
              141,
              3,
              255,
              201,
              232,
              1,
              18,
              206,
              104,
            ],
            "isBounceable": false,
            "isTestOnly": false,
            "isUrlSafe": false,
            "isUserFriendly": false,
            "wc": 0,
          },
          "revokeTime": "00",
          "stakeDate": "660b0cc6",
          "stakedTokens": "df05",
          "status": 1,
        }
      `);
    });
  });

  describe("getPoolCount", () => {
    it("should make on-chain requests and return pool count from response", async () => {
      const tonApiClient = createMockObj<
        InstanceType<typeof TonWeb.HttpProvider>
      >({
        call2: vi.fn(async (...args) => {
          if (
            args[0] ===
              "0:a9e6cccfde60aa018d75b7385da3b444943ce295385b3eecd4176cd37b2606e5" &&
            args[1] === "get_farming_minter_data"
          ) {
            return [
              new BN("2259"),
              new BN("1"),
              new BN("3"),
              new BN("248366349277"),
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
                  "te6ccsECCAEAAYcAAAAABQAKAA4AiQCNAQgBDAIBzQEGAgEgAgQBASADAPEAAAAAAAAAAAA23yPjcpaKGoAAAAAAAAAAAAAAAAAAAAPuCoDGcAAAAAAAAAAAAqElocgfsOkl3MAAAAAAAAAAAAe2B0n8yV0MqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZik2yoAQEgBQDxAAAAAAAAAAAAKloFj8KV7QAAAAAAAAAAAAAAAAAAAAADCH5wJ1AAAAAAAAAAAAIHjk6as+AVqDiAAAAAAAAAAAAF853qH6wPFZgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGYpNsqAEBSAcA8QAAAAAAAAAAAAh4Z4NLTALKgAAAAAAAAAAAAAAAAAAAAHeMn8VwAAAAAAAAAAAAV/GU4EAeCQbzgAAAAAAAAAAAAODauyq4FvE0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmKTbKj/QFOD",
                ),
              ),
              Cell.oneFromBoc(
                base64ToBytes(
                  "te6ccsEBCAEAxAAABQoOSEyGigIBzQEGAgEgAgQBASADAG8AAAAAAAAAAAAAAAHUPO36EjkQkAMAOevgarWLP/P2hL1ntIUBWX6WSBO92ecxt2sYIVc5dj5gIgEBIAUAbwAAAAAAAAAAAAAAAWlmldvRLTiQAwAcvewmHxjAY9t6LA5qs8aaoI2mVS+xBDKNyAvJWZOSGiAiAQFIBwBvAAAAAAAAAAAAAAAAbMlsqFVJlJADAAifWbxZ3ejqWZqGvBoCj7QafH5DzTJGXkbhA09Ad3ViICJCsQ3c",
                ),
              ),
            ];
          }

          if (args[0] === DEPENDENCIES.address && args[1] === "get_nft_data") {
            return [
              new BN("-1"),
              new BN("284"),
              Cell.oneFromBoc(
                base64ToBytes(
                  "te6ccsEBAQEAJAAAAEOAFTzZmfvMFUAxrrbnC7R2iJKHnFKnC2fdmoLtmm9kwNyw4uL7yg==",
                ),
              ),
              Cell.oneFromBoc(
                base64ToBytes(
                  "te6ccsEBAQEAJAAAAEOAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QY+4g6g==",
                ),
              ),
              Cell.oneFromBoc(
                base64ToBytes(
                  "te6ccsEBAQEARwAAAIoyM0MwMzNFODlFMjczNjQ1QkNFQUJFQjc3NEJGOTQ4NDlFRkIxOUQ0NUExMTQ2M0Q5RDE0MzU3MTMwQjU0MjUyLmpzb270VaY4",
                ),
              ),
            ];
          }

          throw new Error(`Unexpected call2: ${args}`);
        }),
      });

      const contract = new FarmNftItemV3({
        ...DEPENDENCIES,
        tonApiClient,
      });

      // @ts-expect-error - method is protected
      const poolCount = await contract.getPoolCount();

      expect(poolCount).toEqual(3);
    });
  });
});
