import type { Sender } from "@ton/ton";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  createMockObj,
  createMockProvider,
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "../../../test-utils";
import { toAddress } from "../../../utils/toAddress";
import { FARM_VERSION } from "../constants";
import { FarmNftItemV3 } from "./FarmNftItemV3";

const ADDRESS = "EQAjwDPonic2Rbzqvrd0v5SEnvsZ1FoRRj2dFDVxMLVCUr62";

describe("FarmNftItemV3", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(FarmNftItemV3.version).toBe(FARM_VERSION.v3);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(FarmNftItemV3.gasConstants.claimRewardsBase).toMatchInlineSnapshot(
        "350000000n",
      );
      expect(
        FarmNftItemV3.gasConstants.claimRewardsPerPool,
      ).toMatchInlineSnapshot("130000000n");
      expect(FarmNftItemV3.gasConstants.destroy).toMatchInlineSnapshot(
        "50000000n",
      );
      expect(FarmNftItemV3.gasConstants.unstakeBase).toMatchInlineSnapshot(
        "450000000n",
      );
      expect(FarmNftItemV3.gasConstants.unstakePerPool).toMatchInlineSnapshot(
        "130000000n",
      );
    });
  });

  describe("create", () => {
    it("should create an instance of FarmNftItemV3 from address", () => {
      const contract = FarmNftItemV3.create(ADDRESS);

      expect(contract).toBeInstanceOf(FarmNftItemV3);
    });
  });

  describe("constructor", () => {
    it("should create an instance of FarmNftItemV3", () => {
      const contract = FarmNftItemV3.create(ADDRESS);

      expect(contract).toBeInstanceOf(FarmNftItemV3);
    });

    it("should create an instance of FarmNftItemV3 with default gasConstants", () => {
      const contract = FarmNftItemV3.create(ADDRESS);

      expect(contract.gasConstants).toEqual(FarmNftItemV3.gasConstants);
    });

    it("should create an instance of FarmNftItemV3 with given gasConstants", () => {
      const gasConstants: Partial<FarmNftItemV3["gasConstants"]> = {
        claimRewardsBase: BigInt("123"),
      };

      const contract = new FarmNftItemV3(ADDRESS, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createClaimRewardsBody", () => {
    it("should build expected tx body for claim from all pools", async () => {
      const contract = FarmNftItemV3.create(ADDRESS);

      const body = await contract.createClaimRewardsBody({
        claimAll: true,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEAAAG3jZ8QkAAAAAAAAAAIBAdseZqw=="',
      );
    });

    it("should build expected tx body for claim from a specific pool", async () => {
      const contract = FarmNftItemV3.create(ADDRESS);

      const body = await contract.createClaimRewardsBody({
        claimAll: false,
        poolIndex: 0,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEAAAG3jZ8QkAAAAAAAAAAABAjz1aUA=="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = FarmNftItemV3.create(ADDRESS);

      const body = await contract.createClaimRewardsBody({
        queryId: 12345,
        claimAll: true,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEAAAG3jZ8QkAAAAAAAAwOYBA5UgumQ=="',
      );
    });
  });

  describe("getClaimRewardsTxParams", () => {
    const txArgs = {
      poolCount: 1,
    };
    const provider = createMockProvider();

    it("should build expected tx params for claim from all pools", async () => {
      const contract = provider.open(FarmNftItemV3.create(ADDRESS));

      const txParams = await contract.getClaimRewardsTxParams({
        ...txArgs,
      });

      expect(txParams.to.toString()).toEqual(ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEAAAG3jZ8QkAAAAAAAAAAIBAdseZqw=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("350000000n");
    });

    it("should build expected tx params for claim from a specific pool", async () => {
      const contract = provider.open(FarmNftItemV3.create(ADDRESS));

      const txParams = await contract.getClaimRewardsTxParams({
        ...txArgs,
        poolCount: 2,
        poolIndex: 1,
      });

      expect(txParams.to.toString()).toEqual(ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEAAAG3jZ8QkAAAAAAAAAAADA9was0g=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("480000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(FarmNftItemV3.create(ADDRESS));

      const txParams = await contract.getClaimRewardsTxParams({
        ...txArgs,
        queryId: 12345,
      });

      expect(txParams.to.toString()).toEqual(ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEAAAG3jZ8QkAAAAAAAAwOYBA5UgumQ=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("350000000n");
    });

    it("gasAmount should be different based on poolCount", async () => {
      const poolsToGasMap = [
        [1, "350000000"],
        [2, "480000000"],
        [3, "610000000"],
      ] as const;

      const contract = provider.open(FarmNftItemV3.create(ADDRESS));

      expect(
        await Promise.all(
          poolsToGasMap.map(async ([poolCount]) => {
            const txParams = await contract.getClaimRewardsTxParams({
              ...txArgs,
              poolCount,
            });

            return txParams.value.toString();
          }),
        ),
      ).toEqual(poolsToGasMap.map(([_, gasAmount]) => gasAmount));
    });
  });

  describe("sendClaimRewards", () => {
    it("should call getClaimRewardsTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<FarmNftItemV3["sendClaimRewards"]>[2];

      const contract = FarmNftItemV3.create(ADDRESS);

      const getClaimRewardsTxParams = vi.spyOn(
        contract,
        "getClaimRewardsTxParams",
      );

      const txParams = {} as Awaited<
        ReturnType<typeof contract.getClaimRewardsTxParams>
      >;

      getClaimRewardsTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendClaimRewards(provider, sender, txArgs);

      expect(getClaimRewardsTxParams).toHaveBeenCalledWith(provider, txArgs);
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("createUnstakeBody", () => {
    it("should build expected tx body", async () => {
      const contract = FarmNftItemV3.create(ADDRESS);

      const body = await contract.createUnstakeBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGLkpZaAAAAAAAAAAAGt/uLY="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = FarmNftItemV3.create(ADDRESS);

      const body = await contract.createUnstakeBody({
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGLkpZaAAAAAAAAAwOZX/p74="',
      );
    });
  });

  describe("getUnstakeTxParams", () => {
    const txArgs = {
      poolCount: 1,
    };
    const provider = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = provider.open(FarmNftItemV3.create(ADDRESS));

      const txParams = await contract.getUnstakeTxParams({
        ...txArgs,
      });

      expect(txParams.to.toString()).toEqual(ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGLkpZaAAAAAAAAAAAGt/uLY="',
      );
      expect(txParams.value).toMatchInlineSnapshot("450000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(FarmNftItemV3.create(ADDRESS));

      const txParams = await contract.getUnstakeTxParams({
        ...txArgs,
        queryId: 12345,
      });

      expect(txParams.to.toString()).toEqual(ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGLkpZaAAAAAAAAAwOZX/p74="',
      );
      expect(txParams.value).toMatchInlineSnapshot("450000000n");
    });

    it("gasAmount should be different based on poolCount", async () => {
      const poolsToGasMap = [
        [1, "450000000"],
        [2, "580000000"],
        [3, "710000000"],
      ] as const;

      const contract = provider.open(FarmNftItemV3.create(ADDRESS));

      expect(
        await Promise.all(
          poolsToGasMap.map(async ([poolCount]) => {
            const txParams = await contract.getUnstakeTxParams({
              ...txArgs,
              poolCount,
            });

            return txParams.value.toString();
          }),
        ),
      ).toEqual(poolsToGasMap.map(([_, gasAmount]) => gasAmount));
    });
  });

  describe("sendUnstake", () => {
    it("should call getUnstakeTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<FarmNftItemV3["sendUnstake"]>[2];

      const contract = FarmNftItemV3.create(ADDRESS);

      const getUnstakeTxParams = vi.spyOn(contract, "getUnstakeTxParams");

      const txParams = {} as Awaited<
        ReturnType<typeof contract.getUnstakeTxParams>
      >;

      getUnstakeTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendUnstake(provider, sender, txArgs);

      expect(getUnstakeTxParams).toHaveBeenCalledWith(provider, txArgs);
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("createDestroyBody", () => {
    it("should build expected tx body", async () => {
      const contract = FarmNftItemV3.create(ADDRESS);

      const body = await contract.createDestroyBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB8EU3oAAAAAAAAAAOpSrEg="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = FarmNftItemV3.create(ADDRESS);

      const body = await contract.createDestroyBody({
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB8EU3oAAAAAAAAwORTSs0A="',
      );
    });
  });

  describe("getDestroyTxParams", () => {
    const provider = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = provider.open(FarmNftItemV3.create(ADDRESS));

      const txParams = await contract.getDestroyTxParams();

      expect(txParams.to.toString()).toEqual(ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB8EU3oAAAAAAAAAAOpSrEg="',
      );
      expect(txParams.value).toMatchInlineSnapshot("50000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(FarmNftItemV3.create(ADDRESS));

      const txParams = await contract.getDestroyTxParams({
        queryId: 12345,
      });

      expect(txParams.to.toString()).toEqual(ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB8EU3oAAAAAAAAwORTSs0A="',
      );
      expect(txParams.value).toMatchInlineSnapshot("50000000n");
    });
  });

  describe("sendDestroy", () => {
    it("should call getDestroyTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<FarmNftItemV3["sendDestroy"]>[2];

      const contract = FarmNftItemV3.create(ADDRESS);

      const getDestroyTxParams = vi.spyOn(contract, "getDestroyTxParams");

      const txParams = {} as Awaited<
        ReturnType<typeof contract.getDestroyTxParams>
      >;

      getDestroyTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendDestroy(provider, sender, txArgs);

      expect(getDestroyTxParams).toHaveBeenCalledWith(provider, txArgs);
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("getFarmingData", () => {
    it("should return data about the farm NFT contract state", async () => {
      const snapshot = createProviderSnapshot()
        .number("1")
        .number("0")
        .number("57093")
        .number("1712000198")
        .cell(
          "te6ccsEBBQEASgAABQofNAIBzQEEAgEgAgMAJgAAAAAAAAAAAAAAAAAAB+tvFgsAJgAAAAAAAAAAAAAAAAAABhzWPD8AJ0AAAAAAAAAAAAAAAAAAACce9JsgTlOb7Q==",
        )
        .cell(
          "te6ccsEBAQEAJAAAAEOAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QY+4g6g==",
        );
      const provider = createMockProviderFromSnapshot(snapshot);

      const contract = provider.open(FarmNftItemV3.create(ADDRESS));

      const data = await contract.getFarmingData();

      expect(data.status).toMatchInlineSnapshot("1");
      expect(data.revokeTime).toMatchInlineSnapshot("0n");
      expect(data.stakedTokens).toMatchInlineSnapshot("57093n");
      expect(data.stakeDate).toMatchInlineSnapshot("1712000198n");
      expect([...data.claimedPerUnit.entries()]).toMatchInlineSnapshot(`
        [
          [
            0,
            34014696971n,
          ],
          [
            1,
            26253605951n,
          ],
          [
            2,
            2625360492n,
          ],
        ]
      `);
      expect(data.ownerAddress).toMatchInlineSnapshot(
        '"EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i"',
      );
    });

    it("should correctly return data about the farm NFT contract state with null dictionaries", async () => {
      const snapshot = createProviderSnapshot()
        .number("1")
        .number("0")
        .number("57093")
        .number("1712000198")
        .null()
        .cell(
          "te6ccsEBAQEAJAAAAEOAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QY+4g6g==",
        );
      const provider = createMockProviderFromSnapshot(snapshot);

      const contract = provider.open(FarmNftItemV3.create(ADDRESS));

      const data = await contract.getFarmingData();

      expect(data.status).toMatchInlineSnapshot("1");
      expect(data.revokeTime).toMatchInlineSnapshot("0n");
      expect(data.stakedTokens).toMatchInlineSnapshot("57093n");
      expect(data.stakeDate).toMatchInlineSnapshot("1712000198n");
      expect([...data.claimedPerUnit.entries()]).toMatchInlineSnapshot("[]");
      expect(data.ownerAddress).toMatchInlineSnapshot(
        '"EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i"',
      );
    });
  });

  describe("getPoolCount", () => {
    it("should make on-chain requests and return pool count from response", async () => {
      const provider = createMockProviderFromSnapshot((address, method) => {
        if (
          toAddress(address).toString() ===
            "EQCp5szP3mCqAY11tzhdo7RElDzilThbPuzUF2zTeyYG5Vyz" &&
          method === "get_farming_minter_data"
        ) {
          return createProviderSnapshot()
            .number("2259")
            .number("1")
            .number("3")
            .number("248366349277")
            .number("103037229")
            .number("864000")
            .cell(
              "te6ccsEBAQEAJAAAAEOAB6QiQ0T/22/J+dCm9MMTbVU4qD4ojxQrph7+3gjW7q+QCf49AQ==",
            )
            .cell(
              "te6ccsEBAQEAJAAAAEOAE1XEnRcjRVi9UD7WrYvKkVyYXqugt8gbjnnHwqvEhL6wioVD+g==",
            )
            .number("-1")
            .number("-1")
            .cell(
              "te6ccsECCAEAAYcAAAAABQAKAA4AiQCNAQgBDAIBzQEGAgEgAgQBASADAPEAAAAAAAAAAAA23yPjcpaKGoAAAAAAAAAAAAAAAAAAAAPuCoDGcAAAAAAAAAAAAqElocgfsOkl3MAAAAAAAAAAAAe2B0n8yV0MqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZik2yoAQEgBQDxAAAAAAAAAAAAKloFj8KV7QAAAAAAAAAAAAAAAAAAAAADCH5wJ1AAAAAAAAAAAAIHjk6as+AVqDiAAAAAAAAAAAAF853qH6wPFZgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGYpNsqAEBSAcA8QAAAAAAAAAAAAh4Z4NLTALKgAAAAAAAAAAAAAAAAAAAAHeMn8VwAAAAAAAAAAAAV/GU4EAeCQbzgAAAAAAAAAAAAODauyq4FvE0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmKTbKj/QFOD",
            )
            .cell(
              "te6ccsEBCAEAxAAABQoOSEyGigIBzQEGAgEgAgQBASADAG8AAAAAAAAAAAAAAAHUPO36EjkQkAMAOevgarWLP/P2hL1ntIUBWX6WSBO92ecxt2sYIVc5dj5gIgEBIAUAbwAAAAAAAAAAAAAAAWlmldvRLTiQAwAcvewmHxjAY9t6LA5qs8aaoI2mVS+xBDKNyAvJWZOSGiAiAQFIBwBvAAAAAAAAAAAAAAAAbMlsqFVJlJADAAifWbxZ3ejqWZqGvBoCj7QafH5DzTJGXkbhA09Ad3ViICJCsQ3c",
            );
        }

        if (address === ADDRESS && method === "get_nft_data") {
          return createProviderSnapshot()
            .number("-1")
            .number("284")
            .cell(
              "te6ccsEBAQEAJAAAAEOAFTzZmfvMFUAxrrbnC7R2iJKHnFKnC2fdmoLtmm9kwNyw4uL7yg==",
            )
            .cell(
              "te6ccsEBAQEAJAAAAEOAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QY+4g6g==",
            )
            .cell(
              "te6ccsEBAQEARwAAAIoyM0MwMzNFODlFMjczNjQ1QkNFQUJFQjc3NEJGOTQ4NDlFRkIxOUQ0NUExMTQ2M0Q5RDE0MzU3MTMwQjU0MjUyLmpzb270VaY4",
            );
        }

        throw new Error(`Unexpected call: ${address} ${method}`);
      });

      const contract = provider.open(FarmNftItemV3.create(ADDRESS));

      const poolCount = await contract.getPoolCount();

      expect(poolCount).toEqual(3);
    });
  });
});
