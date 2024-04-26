import TonWeb from "tonweb";
import { describe, it, expect, vi } from "vitest";

import { createMockObj } from "@/test-utils";

import { FARM_VERSION } from "../constants";

import { FarmNftItemV1 } from "./FarmNftItemV1";

const {
  utils: { BN, bytesToBase64 },
  boc: { Cell },
} = TonWeb;

const FARM_NFT_ITEM_ADDRESS =
  "EQCGC83Vj6THtc34339ypEtpYReCRSJpeVRvQJRYqVGvS78h"; // ston/ton v1 farm nft

const DEPENDENCIES = {
  address: FARM_NFT_ITEM_ADDRESS,
  tonApiClient: createMockObj<InstanceType<typeof TonWeb.HttpProvider>>(),
};

describe("FarmNftItemV1", () => {
  describe("version", () => {
    it("should have expected static value", () => {
      expect(FarmNftItemV1.version).toBe(FARM_VERSION.v1);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(FarmNftItemV1.gasConstants).toMatchInlineSnapshot(
        `
        {
          "claimRewards": "11e1a300",
          "destroy": "02faf080",
          "unstake": "17d78400",
        }
      `,
      );
    });
  });

  describe("constructor", () => {
    it("should create an instance of FarmNftItemV1", () => {
      const contract = new FarmNftItemV1({
        ...DEPENDENCIES,
      });

      expect(contract).toBeInstanceOf(FarmNftItemV1);
    });

    it("should create an instance of FarmNftItemV1 with default gasConstants", () => {
      const contract = new FarmNftItemV1({
        ...DEPENDENCIES,
      });

      expect(contract.gasConstants).toEqual(FarmNftItemV1.gasConstants);
    });

    it("should create an instance of FarmNftItemV1 with given gasConstants", () => {
      const gasConstants: Partial<FarmNftItemV1["gasConstants"]> = {
        destroy: new BN("1"),
      };

      const contract = new FarmNftItemV1({
        ...DEPENDENCIES,
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createClaimRewardsBody", () => {
    const txArguments = {};

    it("should build expected tx body", async () => {
      const contract = new FarmNftItemV1({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const body = await contract.createClaimRewardsBody({
        ...txArguments,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABh42fEJAAAAAAAAAAAlRup5"',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = new FarmNftItemV1({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const body = await contract.createClaimRewardsBody({
        ...txArguments,
        queryId: 12345,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABh42fEJAAAAAAAAMDnbxvVx"',
      );
    });
  });

  describe("buildClaimRewardsTxParams", () => {
    const txParams = {};

    it("should build expected tx params", async () => {
      const contract = new FarmNftItemV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildClaimRewardsTxParams({
        ...txParams,
      });

      expect(params.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABh42fEJAAAAAAAAAAAlRup5"',
      );
      expect(params.gasAmount).toBe(contract.gasConstants.claimRewards);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new FarmNftItemV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildClaimRewardsTxParams({
        ...txParams,
        queryId: 12345,
      });

      expect(params.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABh42fEJAAAAAAAAMDnbxvVx"',
      );
      expect(params.gasAmount).toBe(contract.gasConstants.claimRewards);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = new FarmNftItemV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildClaimRewardsTxParams({
        ...txParams,
        gasAmount: new BN("1"),
      });

      expect(params.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABh42fEJAAAAAAAAAAAlRup5"',
      );
      expect(params.gasAmount).toEqual(new BN("1"));
    });
  });

  describe("createUnstakeBody", () => {
    const txArguments = {};

    it("should build expected tx body", async () => {
      const contract = new FarmNftItemV1({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const body = await contract.createUnstakeBody({
        ...txArguments,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABi5KWWgAAAAAAAAAACwvsVD"',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = new FarmNftItemV1({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const body = await contract.createUnstakeBody({
        ...txArguments,
        queryId: 12345,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABi5KWWgAAAAAAAAMDlOPtpL"',
      );
    });
  });

  describe("buildUnstakeTxParams", () => {
    const txParams = {};

    it("should build expected tx params", async () => {
      const contract = new FarmNftItemV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildUnstakeTxParams({
        ...txParams,
      });

      expect(params.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABi5KWWgAAAAAAAAAACwvsVD"',
      );
      expect(params.gasAmount).toBe(contract.gasConstants.unstake);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new FarmNftItemV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildUnstakeTxParams({
        ...txParams,
        queryId: 12345,
      });

      expect(params.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABi5KWWgAAAAAAAAMDlOPtpL"',
      );
      expect(params.gasAmount).toBe(contract.gasConstants.unstake);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = new FarmNftItemV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildUnstakeTxParams({
        ...txParams,
        gasAmount: new BN("1"),
      });

      expect(params.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABi5KWWgAAAAAAAAAACwvsVD"',
      );
      expect(params.gasAmount).toEqual(new BN("1"));
    });
  });

  describe("getFarmingData", () => {
    const snapshot = [
      new BN("1"),
      new BN("-1"),
      new BN("322404"),
      new BN("387977365331"),
    ];

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn().mockResolvedValue(snapshot),
    });

    it("should make on-chain request and return parsed response", async () => {
      const contract = new FarmNftItemV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const data = await contract.getFarmingData();

      expect(data.status).toBe(1);
      expect(data.isSoulbound).toBe(true);
      expect(data.stakedTokens.toString()).toBe("322404");
      expect(data.claimedPerUnitNanorewards.toString()).toBe("387977365331");
    });
  });
});
