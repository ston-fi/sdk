import TonWeb from "tonweb";
import { describe, it, expect, vi } from "vitest";

import { createMockObj } from "@/test-utils";

import { FARM_VERSION } from "../constants";

import { FarmNftItemV2 } from "./FarmNftItemV2";

const {
  utils: { BN, bytesToBase64 },
  boc: { Cell },
} = TonWeb;

const FARM_NFT_ITEM_ADDRESS =
  "EQBInadPyW_tbmZUcIX8swDdm_N9X3WeF9PLENhzdm1nDqI_"; // ston/ton v2 farm nft

const DEPENDENCIES = {
  address: FARM_NFT_ITEM_ADDRESS,
  tonApiClient: createMockObj<InstanceType<typeof TonWeb.HttpProvider>>(),
};

describe("FarmNftItemV2", () => {
  describe("version", () => {
    it("should have expected static value", () => {
      expect(FarmNftItemV2.version).toBe(FARM_VERSION.v2);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(FarmNftItemV2.gasConstants).toMatchInlineSnapshot(
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
    it("should create an instance of FarmNftItemV2", () => {
      const contract = new FarmNftItemV2({
        ...DEPENDENCIES,
      });

      expect(contract).toBeInstanceOf(FarmNftItemV2);
    });

    it("should create an instance of FarmNftItemV2 with default gasConstants", () => {
      const contract = new FarmNftItemV2({
        ...DEPENDENCIES,
      });

      expect(contract.gasConstants).toEqual(FarmNftItemV2.gasConstants);
    });

    it("should create an instance of FarmNftItemV2 with given gasConstants", () => {
      const gasConstants: Partial<FarmNftItemV2["gasConstants"]> = {
        destroy: new BN("1"),
      };

      const contract = new FarmNftItemV2({
        ...DEPENDENCIES,
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createDestroyBody", () => {
    const txArguments = {};

    it("should build expected tx body", async () => {
      const contract = new FarmNftItemV2({
        ...DEPENDENCIES,
      });

      const body = await contract.createDestroyBody({
        ...txArguments,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgfBFN6AAAAAAAAAAAxk9G9"',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = new FarmNftItemV2({
        ...DEPENDENCIES,
      });

      const body = await contract.createDestroyBody({
        queryId: 12345,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgfBFN6AAAAAAAAMDnPE861"',
      );
    });
  });

  describe("buildDestroyTxParams", () => {
    const txParams = {};

    it("should build expected tx params", async () => {
      const contract = new FarmNftItemV2({
        ...DEPENDENCIES,
      });

      const params = await contract.buildDestroyTxParams({
        ...txParams,
      });

      expect(params.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgfBFN6AAAAAAAAAAAxk9G9"',
      );
      expect(params.gasAmount).toBe(contract.gasConstants.destroy);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new FarmNftItemV2({
        ...DEPENDENCIES,
      });

      const params = await contract.buildDestroyTxParams({
        ...txParams,
        queryId: 12345,
      });

      expect(params.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgfBFN6AAAAAAAAMDnPE861"',
      );
      expect(params.gasAmount).toBe(contract.gasConstants.destroy);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = new FarmNftItemV2({
        ...DEPENDENCIES,
      });

      const params = await contract.buildDestroyTxParams({
        ...txParams,
        gasAmount: new BN("1"),
      });

      expect(params.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgfBFN6AAAAAAAAAAAxk9G9"',
      );
      expect(params.gasAmount).toEqual(new BN("1"));
    });
  });

  describe("getFarmingData", () => {
    const snapshot = [
      new BN("1"),
      new BN("0"),
      new BN("10000"),
      new BN("843078788640"),
      new BN("1711040142"),
    ];

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn().mockResolvedValue(snapshot),
    });

    it("should make on-chain request and return parsed response", async () => {
      const contract = new FarmNftItemV2({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const data = await contract.getFarmingData();

      expect(data.status).toBe(1);
      expect(data.revokeTime).toStrictEqual(new BN("0"));
      expect(data.stakedTokens.toString()).toBe("10000");
      expect(data.claimedPerUnitNanorewards.toString()).toBe("843078788640");
      expect(data.stakeDate.toString()).toBe("1711040142");
    });
  });
});
