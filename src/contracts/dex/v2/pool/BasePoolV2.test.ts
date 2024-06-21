import { beforeAll, describe, expect, it, vi } from "vitest";
import type { Sender } from "@ton/ton";

import {
  createMockObj,
  createMockProvider,
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "@/test-utils";

import { DEX_VERSION } from "../../constants";

import { BasePoolV2 } from "./BasePoolV2";

const USER_WALLET_ADDRESS = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";
const POOL_ADDRESS = "EQA1RBeyynW3klroUF_n6hTRNySIbeUagf0H-FBnpGuwna3t"; // STON/GEMSTON pool

describe("BasePoolV2", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(BasePoolV2.version).toBe(DEX_VERSION.v2);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(BasePoolV2.gasConstants.burn).toMatchInlineSnapshot("800000000n");
      expect(BasePoolV2.gasConstants.collectFees).toMatchInlineSnapshot(
        "400000000n",
      );
    });
  });

  describe("constructor", () => {
    it("should create an instance of BasePoolV2", () => {
      const contract = BasePoolV2.create(POOL_ADDRESS);

      expect(contract).toBeInstanceOf(BasePoolV2);
    });

    it("should create an instance of BasePoolV2 with default gasConstants", () => {
      const contract = BasePoolV2.create(POOL_ADDRESS);

      expect(contract.gasConstants).toEqual(BasePoolV2.gasConstants);
    });

    it("should create an instance of BasePoolV2 with given gasConstants", () => {
      const gasConstants: Partial<BasePoolV2["gasConstants"]> = {
        burn: BigInt("1"),
        collectFees: BigInt("2"),
      };

      const contract = new BasePoolV2(POOL_ADDRESS, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createCollectFeesBody", () => {
    it("should build expected tx body", async () => {
      const contract = BasePoolV2.create(POOL_ADDRESS);

      const body = await contract.createCollectFeesBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB/LfT0AAAAAAAAAAOHc0mQ="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = BasePoolV2.create(POOL_ADDRESS);

      const body = await contract.createCollectFeesBody({
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB/LfT0AAAAAAAAwOR9czWw="',
      );
    });
  });

  describe("getCollectFeeTxParams", () => {
    const provider = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = provider.open(BasePoolV2.create(POOL_ADDRESS));

      const params = await contract.getCollectFeeTxParams();

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQA1RBeyynW3klroUF_n6hTRNySIbeUagf0H-FBnpGuwna3t"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB/LfT0AAAAAAAAAAOHc0mQ="',
      );
      expect(params.value).toMatchInlineSnapshot("400000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BasePoolV2.create(POOL_ADDRESS));

      const params = await contract.getCollectFeeTxParams({
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQA1RBeyynW3klroUF_n6hTRNySIbeUagf0H-FBnpGuwna3t"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB/LfT0AAAAAAAAwOR9czWw="',
      );
      expect(params.value).toMatchInlineSnapshot("400000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(BasePoolV2.create(POOL_ADDRESS));

      const params = await contract.getCollectFeeTxParams({
        gasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQA1RBeyynW3klroUF_n6hTRNySIbeUagf0H-FBnpGuwna3t"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB/LfT0AAAAAAAAAAOHc0mQ="',
      );
      expect(params.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendCollectFees", () => {
    it("should call getCollectFeeTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<BasePoolV2["sendCollectFees"]>[2];

      const contract = BasePoolV2.create(POOL_ADDRESS);

      const getCollectFeeTxParams = vi.spyOn(contract, "getCollectFeeTxParams");

      const txParams = {} as Awaited<
        ReturnType<(typeof contract)["getCollectFeeTxParams"]>
      >;

      getCollectFeeTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendCollectFees(provider, sender, txArgs);

      expect(contract.getCollectFeeTxParams).toHaveBeenCalledWith(
        provider,
        txArgs,
      );
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("createBurnBody", () => {
    const txParams = {
      amount: "1000000000",
    };

    it("should build expected tx body", async () => {
      const contract = BasePoolV2.create(POOL_ADDRESS);

      const body = await contract.createBurnBody({
        ...txParams,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEwAAIVlfB7wAAAAAAAAAAEO5rKABu8koZQ=="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = BasePoolV2.create(POOL_ADDRESS);

      const body = await contract.createBurnBody({
        ...txParams,
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEwAAIVlfB7wAAAAAAAAwOUO5rKABFeXmDg=="',
      );
    });
  });

  describe("getBurnTxParams", () => {
    const txParams = {
      amount: "1000000000",
      userWalletAddress: USER_WALLET_ADDRESS,
    };

    const provider = createMockProviderFromSnapshot((address, method) => {
      if (address === POOL_ADDRESS && method === "get_wallet_address")
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOACstDZ3ATHWF//MUN1iK/rfVwlHFuhUxxdp3sB2jMtipQs2Cj5Q==",
        );

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(BasePoolV2.create(POOL_ADDRESS));

      const params = await contract.getBurnTxParams({
        ...txParams,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBWWhs7gJjrC__mKG6xFf1vq4Sji3QqY4u072A7RmWxUoT1"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEwAAIVlfB7wAAAAAAAAAAEO5rKABu8koZQ=="',
      );
      expect(params.value).toMatchInlineSnapshot("800000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BasePoolV2.create(POOL_ADDRESS));

      const params = await contract.getBurnTxParams({
        ...txParams,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBWWhs7gJjrC__mKG6xFf1vq4Sji3QqY4u072A7RmWxUoT1"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEwAAIVlfB7wAAAAAAAAwOUO5rKABFeXmDg=="',
      );
      expect(params.value).toMatchInlineSnapshot("800000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(BasePoolV2.create(POOL_ADDRESS));

      const params = await contract.getBurnTxParams({
        ...txParams,
        gasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBWWhs7gJjrC__mKG6xFf1vq4Sji3QqY4u072A7RmWxUoT1"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEwAAIVlfB7wAAAAAAAAAAEO5rKABu8koZQ=="',
      );
      expect(params.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendBurn", () => {
    it("should call getBurnTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<BasePoolV2["sendBurn"]>[2];

      const contract = BasePoolV2.create(POOL_ADDRESS);

      const getBurnTxParams = vi.spyOn(contract, "getBurnTxParams");

      const txParams = {} as Awaited<
        ReturnType<(typeof contract)["getBurnTxParams"]>
      >;

      getBurnTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendBurn(provider, sender, txArgs);

      expect(contract.getBurnTxParams).toHaveBeenCalledWith(provider, txArgs);
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });
});
