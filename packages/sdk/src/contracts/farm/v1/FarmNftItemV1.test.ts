import type { Sender } from "@ton/ton";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  createMockObj,
  createMockProvider,
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "../../../test-utils";

import { FARM_VERSION } from "../constants";

import { FarmNftItemV1 } from "./FarmNftItemV1";

const FARM_NFT_ITEM_ADDRESS =
  "EQCGC83Vj6THtc34339ypEtpYReCRSJpeVRvQJRYqVGvS78h"; // ston/ton v1 farm nft

describe("FarmNftItemV1", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(FarmNftItemV1.version).toBe(FARM_VERSION.v1);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(FarmNftItemV1.gasConstants.claimRewards).toMatchInlineSnapshot(
        "300000000n",
      );
      expect(FarmNftItemV1.gasConstants.unstake).toMatchInlineSnapshot(
        "400000000n",
      );
      expect(FarmNftItemV1.gasConstants.destroy).toMatchInlineSnapshot(
        "50000000n",
      );
    });
  });

  describe("create", () => {
    it("should create an instance of FarmNftItemV1 from address", () => {
      const contract = FarmNftItemV1.create(FARM_NFT_ITEM_ADDRESS);

      expect(contract).toBeInstanceOf(FarmNftItemV1);
    });
  });

  describe("constructor", () => {
    it("should create an instance of FarmNftItemV1", () => {
      const contract = FarmNftItemV1.create(FARM_NFT_ITEM_ADDRESS);

      expect(contract).toBeInstanceOf(FarmNftItemV1);
    });

    it("should create an instance of FarmNftItemV1 with default gasConstants", () => {
      const contract = FarmNftItemV1.create(FARM_NFT_ITEM_ADDRESS);

      expect(contract.gasConstants).toEqual(FarmNftItemV1.gasConstants);
    });

    it("should create an instance of FarmNftItemV1 with given gasConstants", () => {
      const gasConstants: Partial<FarmNftItemV1["gasConstants"]> = {
        destroy: BigInt("1"),
      };

      const contract = new FarmNftItemV1(FARM_NFT_ITEM_ADDRESS, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createClaimRewardsBody", () => {
    it("should build expected tx body", async () => {
      const contract = FarmNftItemV1.create(FARM_NFT_ITEM_ADDRESS);

      const body = await contract.createClaimRewardsBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGHjZ8QkAAAAAAAAAAP6Hl4w="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = FarmNftItemV1.create(FARM_NFT_ITEM_ADDRESS);

      const body = await contract.createClaimRewardsBody({
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGHjZ8QkAAAAAAAAwOQAHiIQ="',
      );
    });
  });

  describe("getClaimRewardsTxParams", () => {
    const provider = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = provider.open(
        FarmNftItemV1.create(FARM_NFT_ITEM_ADDRESS),
      );

      const txParams = await contract.getClaimRewardsTxParams();

      expect(txParams.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGHjZ8QkAAAAAAAAAAP6Hl4w="',
      );
      expect(txParams.value).toBe(contract.gasConstants.claimRewards);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(
        FarmNftItemV1.create(FARM_NFT_ITEM_ADDRESS),
      );

      const txParams = await contract.getClaimRewardsTxParams({
        queryId: 12345,
      });

      expect(txParams.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGHjZ8QkAAAAAAAAwOQAHiIQ="',
      );
      expect(txParams.value).toBe(contract.gasConstants.claimRewards);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(
        FarmNftItemV1.create(FARM_NFT_ITEM_ADDRESS),
      );

      const txParams = await contract.getClaimRewardsTxParams({
        gasAmount: "1",
      });

      expect(txParams.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGHjZ8QkAAAAAAAAAAP6Hl4w="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendClaimRewards", () => {
    it("should call getClaimRewardsTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<FarmNftItemV1["sendClaimRewards"]>[2];

      const contract = FarmNftItemV1.create(FARM_NFT_ITEM_ADDRESS);

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
      const contract = FarmNftItemV1.create(FARM_NFT_ITEM_ADDRESS);

      const body = await contract.createUnstakeBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGLkpZaAAAAAAAAAAAGt/uLY="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = FarmNftItemV1.create(FARM_NFT_ITEM_ADDRESS);

      const body = await contract.createUnstakeBody({
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGLkpZaAAAAAAAAAwOZX/p74="',
      );
    });
  });

  describe("getUnstakeTxParams", () => {
    const provider = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = provider.open(
        FarmNftItemV1.create(FARM_NFT_ITEM_ADDRESS),
      );

      const txParams = await contract.getUnstakeTxParams();

      expect(txParams.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGLkpZaAAAAAAAAAAAGt/uLY="',
      );
      expect(txParams.value).toBe(contract.gasConstants.unstake);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(
        FarmNftItemV1.create(FARM_NFT_ITEM_ADDRESS),
      );

      const txParams = await contract.getUnstakeTxParams({
        queryId: 12345,
      });

      expect(txParams.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGLkpZaAAAAAAAAAwOZX/p74="',
      );
      expect(txParams.value).toBe(contract.gasConstants.unstake);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(
        FarmNftItemV1.create(FARM_NFT_ITEM_ADDRESS),
      );

      const txParams = await contract.getUnstakeTxParams({
        gasAmount: "1",
      });

      expect(txParams.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGLkpZaAAAAAAAAAAAGt/uLY="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendUnstake", () => {
    it("should call getUnstakeTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<FarmNftItemV1["sendUnstake"]>[2];

      const contract = FarmNftItemV1.create(FARM_NFT_ITEM_ADDRESS);

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

  describe("getFarmingData", () => {
    const snapshot = createProviderSnapshot()
      .number("1")
      .number("-1")
      .number("322404")
      .number("387977365331");
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(
        FarmNftItemV1.create(FARM_NFT_ITEM_ADDRESS),
      );

      const data = await contract.getFarmingData();

      expect(data.status).toBe(1);
      expect(data.isSoulbound).toBe(true);
      expect(data.stakedTokens).toMatchInlineSnapshot("322404n");
      expect(data.claimedPerUnitNanorewards).toMatchInlineSnapshot(
        "387977365331n",
      );
    });
  });
});
