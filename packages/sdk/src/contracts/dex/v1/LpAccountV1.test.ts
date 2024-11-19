import type { Sender } from "@ton/ton";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  createMockObj,
  createMockProvider,
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "../../../test-utils";

import { DEX_VERSION } from "../constants";

import { LpAccountV1 } from "./LpAccountV1";

const LP_ACCOUNT_ADDRESS = "EQD9KyZJ3cwbaDphNjXa_nJvxApEUJOvFGZrcbDTuke6Fs7B"; // LP account of `UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn` wallet for STON/GEMSTON pool

describe("LpAccountV1", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(LpAccountV1.version).toBe(DEX_VERSION.v1);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(LpAccountV1.gasConstants.directAddLp).toMatchInlineSnapshot(
        "300000000n",
      );
      expect(LpAccountV1.gasConstants.refund).toMatchInlineSnapshot(
        "300000000n",
      );
      expect(LpAccountV1.gasConstants.resetGas).toMatchInlineSnapshot(
        "300000000n",
      );
    });
  });

  describe("create", () => {
    it("should create an instance of LpAccountV1 from address", () => {
      const contract = LpAccountV1.create(LP_ACCOUNT_ADDRESS);

      expect(contract).toBeInstanceOf(LpAccountV1);
    });
  });

  describe("constructor", () => {
    it("should create an instance of LpAccountV1", () => {
      const contract = LpAccountV1.create(LP_ACCOUNT_ADDRESS);

      expect(contract).toBeInstanceOf(LpAccountV1);
    });

    it("should create an instance of LpAccountV1 with default gasConstants", () => {
      const contract = LpAccountV1.create(LP_ACCOUNT_ADDRESS);

      expect(contract.gasConstants).toEqual(LpAccountV1.gasConstants);
    });

    it("should create an instance of LpAccountV1 with given gasConstants", () => {
      const gasConstants: Partial<LpAccountV1["gasConstants"]> = {
        refund: BigInt("1"),
        directAddLp: BigInt("2"),
        resetGas: BigInt("3"),
      };

      const contract = new LpAccountV1(LP_ACCOUNT_ADDRESS, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createRefundBody", () => {
    it("should build expected tx body", async () => {
      const contract = LpAccountV1.create(LP_ACCOUNT_ADDRESS);

      const body = await contract.createRefundBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGAvz9EcAAAAAAAAAANCoHB4="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = LpAccountV1.create(LP_ACCOUNT_ADDRESS);

      const body = await contract.createRefundBody({
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGAvz9EcAAAAAAAAwOS4oAxY="',
      );
    });
  });

  describe("getRefundTxParams", () => {
    const provider = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = provider.open(LpAccountV1.create(LP_ACCOUNT_ADDRESS));

      const txParams = await contract.getRefundTxParams();

      expect(txParams.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGAvz9EcAAAAAAAAAANCoHB4="',
      );
      expect(txParams.value).toBe(contract.gasConstants.refund);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(LpAccountV1.create(LP_ACCOUNT_ADDRESS));

      const txParams = await contract.getRefundTxParams({
        queryId: 12345,
      });

      expect(txParams.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGAvz9EcAAAAAAAAwOS4oAxY="',
      );
      expect(txParams.value).toBe(contract.gasConstants.refund);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(LpAccountV1.create(LP_ACCOUNT_ADDRESS));

      const txParams = await contract.getRefundTxParams({
        gasAmount: "1",
      });

      expect(txParams.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGAvz9EcAAAAAAAAAANCoHB4="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendRefund", () => {
    it("should call getRefundTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<LpAccountV1["sendRefund"]>[2];

      const contract = LpAccountV1.create(LP_ACCOUNT_ADDRESS);

      const getRefundTxParams = vi.spyOn(contract, "getRefundTxParams");

      const txParams = {} as Awaited<
        ReturnType<(typeof contract)["getRefundTxParams"]>
      >;

      getRefundTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendRefund(provider, sender, txArgs);

      expect(contract.getRefundTxParams).toHaveBeenCalledWith(provider, txArgs);
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("createDirectAddLiquidityBody", () => {
    const txParams = {
      amount0: "1000000000",
      amount1: "2000000000",
    };

    it("should build expected tx body", async () => {
      const contract = LpAccountV1.create(LP_ACCOUNT_ADDRESS);

      const body = await contract.createDirectAddLiquidityBody({
        ...txParams,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAGQAALUz4KAMAAAAAAAAAAEO5rKAEdzWUABAYcHfdXg=="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = LpAccountV1.create(LP_ACCOUNT_ADDRESS);

      const body = await contract.createDirectAddLiquidityBody({
        ...txParams,
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAGQAALUz4KAMAAAAAAAAwOUO5rKAEdzWUABAYwTuNzw=="',
      );
    });

    it("should build expected tx body when minimumLpToMint is defined", async () => {
      const contract = LpAccountV1.create(LP_ACCOUNT_ADDRESS);

      const body = await contract.createDirectAddLiquidityBody({
        ...txParams,
        minimumLpToMint: "300",
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAGgAAL0z4KAMAAAAAAAAAAEO5rKAEdzWUACASyH+t4/4="',
      );
    });
  });

  describe("getDirectAddLiquidityTxParams", () => {
    const txArgs = {
      amount0: "1",
      amount1: "2",
    };

    const provider = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = provider.open(LpAccountV1.create(LP_ACCOUNT_ADDRESS));

      const txParams = await contract.getDirectAddLiquidityTxParams({
        ...txArgs,
      });

      expect(txParams.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEwAAIUz4KAMAAAAAAAAAABARAhAYcJq3kQ=="',
      );
      expect(txParams.value).toBe(contract.gasConstants.directAddLp);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(LpAccountV1.create(LP_ACCOUNT_ADDRESS));

      const txParams = await contract.getDirectAddLiquidityTxParams({
        ...txArgs,
        queryId: 12345,
      });

      expect(txParams.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEwAAIUz4KAMAAAAAAAAwORARAhAY3rZ5+g=="',
      );
      expect(txParams.value).toBe(contract.gasConstants.directAddLp);
    });

    it("should build expected tx params when minimumLpToMint is defined", async () => {
      const contract = provider.open(LpAccountV1.create(LP_ACCOUNT_ADDRESS));

      const txParams = await contract.getDirectAddLiquidityTxParams({
        ...txArgs,
        minimumLpToMint: "3",
      });

      expect(txParams.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEwAAIUz4KAMAAAAAAAAAABARAhA4rhQKsQ=="',
      );
      expect(txParams.value).toBe(contract.gasConstants.directAddLp);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(LpAccountV1.create(LP_ACCOUNT_ADDRESS));

      const txParams = await contract.getDirectAddLiquidityTxParams({
        ...txArgs,
        gasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQD9KyZJ3cwbaDphNjXa_nJvxApEUJOvFGZrcbDTuke6Fs7B"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEwAAIUz4KAMAAAAAAAAAABARAhAYcJq3kQ=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendDirectAddLiquidity", () => {
    it("should call getDirectAddLiquidityTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<LpAccountV1["sendDirectAddLiquidity"]>[2];

      const contract = LpAccountV1.create(LP_ACCOUNT_ADDRESS);

      const getDirectAddLiquidityTxParams = vi.spyOn(
        contract,
        "getDirectAddLiquidityTxParams",
      );

      const txParams = {} as Awaited<
        ReturnType<(typeof contract)["getDirectAddLiquidityTxParams"]>
      >;

      getDirectAddLiquidityTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendDirectAddLiquidity(provider, sender, txArgs);

      expect(contract.getDirectAddLiquidityTxParams).toHaveBeenCalledWith(
        provider,
        txArgs,
      );
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("createResetGasBody", () => {
    it("should build expected tx body", async () => {
      const contract = LpAccountV1.create(LP_ACCOUNT_ADDRESS);

      const body = await contract.createResetGasBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGEKg+0MAAAAAAAAAAPc9hrQ="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = LpAccountV1.create(LP_ACCOUNT_ADDRESS);

      const body = await contract.createResetGasBody({
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGEKg+0MAAAAAAAAwOQm9mbw="',
      );
    });
  });

  describe("getResetGasTxParams", () => {
    const provider = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = provider.open(LpAccountV1.create(LP_ACCOUNT_ADDRESS));

      const txParams = await contract.getResetGasTxParams();

      expect(txParams.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGEKg+0MAAAAAAAAAAPc9hrQ="',
      );
      expect(txParams.value).toBe(contract.gasConstants.resetGas);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(LpAccountV1.create(LP_ACCOUNT_ADDRESS));

      const txParams = await contract.getResetGasTxParams({
        queryId: 12345,
      });

      expect(txParams.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGEKg+0MAAAAAAAAwOQm9mbw="',
      );
      expect(txParams.value).toBe(contract.gasConstants.resetGas);
    });
  });

  describe("sendResetGas", () => {
    it("should call getResetGasTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<LpAccountV1["sendResetGas"]>[2];

      const contract = LpAccountV1.create(LP_ACCOUNT_ADDRESS);

      const getResetGasTxParams = vi.spyOn(contract, "getResetGasTxParams");

      const txParams = {} as Awaited<
        ReturnType<(typeof contract)["getResetGasTxParams"]>
      >;

      getResetGasTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendResetGas(provider, sender, txArgs);

      expect(contract.getResetGasTxParams).toHaveBeenCalledWith(
        provider,
        txArgs,
      );
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("getLpAccountData", () => {
    it("should make on-chain request and return parsed response", async () => {
      const snapshot = createProviderSnapshot()
        .cell(
          "te6ccsEBAQEAJAAAAEOAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QY+4g6g==",
        )
        .cell(
          "te6ccsEBAQEAJAAAAEOAFL81j9ygFp1c3p71Zs3Um3CwytFAzr8LITNsQqQYk1nQDFEwYA==",
        )
        .number("0")
        .number("0");

      const provider = createMockProviderFromSnapshot(snapshot);

      const contract = provider.open(LpAccountV1.create(LP_ACCOUNT_ADDRESS));

      const data = await contract.getLpAccountData();

      expect(data.userAddress).toMatchInlineSnapshot(
        '"EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i"',
      );
      expect(data.poolAddress).toMatchInlineSnapshot(
        '"EQCl-ax-5QC06ub096s2bqTbhYZWigZ1-FkJm2IVIMSazp7U"',
      );
      expect(data.amount0).toMatchInlineSnapshot("0n");
      expect(data.amount1).toMatchInlineSnapshot("0n");
    });
  });
});
