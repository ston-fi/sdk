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

import { FarmNftItemV2 } from "./FarmNftItemV2";

const FARM_NFT_ITEM_ADDRESS =
  "EQBInadPyW_tbmZUcIX8swDdm_N9X3WeF9PLENhzdm1nDqI_"; // ston/ton v2 farm nft

describe("FarmNftItemV2", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(FarmNftItemV2.version).toBe(FARM_VERSION.v2);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(FarmNftItemV2.gasConstants.claimRewards).toMatchInlineSnapshot(
        "300000000n",
      );
      expect(FarmNftItemV2.gasConstants.unstake).toMatchInlineSnapshot(
        "400000000n",
      );
      expect(FarmNftItemV2.gasConstants.destroy).toMatchInlineSnapshot(
        "50000000n",
      );
    });
  });

  describe("create", () => {
    it("should create an instance of FarmNftItemV2 from address", () => {
      const contract = FarmNftItemV2.create(FARM_NFT_ITEM_ADDRESS);

      expect(contract).toBeInstanceOf(FarmNftItemV2);
    });
  });

  describe("constructor", () => {
    it("should create an instance of FarmNftItemV2", () => {
      const contract = FarmNftItemV2.create(FARM_NFT_ITEM_ADDRESS);

      expect(contract).toBeInstanceOf(FarmNftItemV2);
    });

    it("should create an instance of FarmNftItemV2 with default gasConstants", () => {
      const contract = FarmNftItemV2.create(FARM_NFT_ITEM_ADDRESS);

      expect(contract.gasConstants).toEqual(FarmNftItemV2.gasConstants);
    });

    it("should create an instance of FarmNftItemV2 with given gasConstants", () => {
      const gasConstants: Partial<FarmNftItemV2["gasConstants"]> = {
        destroy: BigInt("1"),
      };

      const contract = new FarmNftItemV2(FARM_NFT_ITEM_ADDRESS, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createDestroyBody", () => {
    it("should build expected tx body", async () => {
      const contract = FarmNftItemV2.create(FARM_NFT_ITEM_ADDRESS);

      const body = await contract.createDestroyBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB8EU3oAAAAAAAAAAOpSrEg="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = FarmNftItemV2.create(FARM_NFT_ITEM_ADDRESS);

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
      const contract = provider.open(
        FarmNftItemV2.create(FARM_NFT_ITEM_ADDRESS),
      );

      const txParams = await contract.getDestroyTxParams();

      expect(txParams.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB8EU3oAAAAAAAAAAOpSrEg="',
      );
      expect(txParams.value).toBe(contract.gasConstants.destroy);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(
        FarmNftItemV2.create(FARM_NFT_ITEM_ADDRESS),
      );

      const txParams = await contract.getDestroyTxParams({
        queryId: 12345,
      });

      expect(txParams.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB8EU3oAAAAAAAAwORTSs0A="',
      );
      expect(txParams.value).toBe(contract.gasConstants.destroy);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(
        FarmNftItemV2.create(FARM_NFT_ITEM_ADDRESS),
      );

      const txParams = await contract.getDestroyTxParams({
        gasAmount: "1",
      });

      expect(txParams.to.toString()).toBe(FARM_NFT_ITEM_ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB8EU3oAAAAAAAAAAOpSrEg="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendDestroy", () => {
    it("should call getDestroyTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<FarmNftItemV2["sendDestroy"]>[2];

      const contract = FarmNftItemV2.create(FARM_NFT_ITEM_ADDRESS);

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
    const snapshot = createProviderSnapshot()
      .number("1")
      .number("0")
      .number("10000")
      .number("843078788640")
      .number("1711040142");
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(
        FarmNftItemV2.create(FARM_NFT_ITEM_ADDRESS),
      );

      const data = await contract.getFarmingData();

      expect(data.status).toBe(1);
      expect(data.revokeTime).toMatchInlineSnapshot("0n");
      expect(data.stakedTokens).toMatchInlineSnapshot("10000n");
      expect(data.claimedPerUnitNanorewards).toMatchInlineSnapshot(
        "843078788640n",
      );
      expect(data.stakeDate).toMatchInlineSnapshot("1711040142n");
    });
  });
});
