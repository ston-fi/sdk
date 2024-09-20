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

import { LpAccountV2_1 } from "./LpAccountV2_1";

const USER_WALLET_ADDRESS = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";
const LP_ACCOUNT_ADDRESS = "EQAAPP517U137Zx7xkNgzm662hGlxuL20iiQDRtwemhWTPLx"; // LP account of `USER_WALLET_ADDRESS` wallet for TestRED/TestBLUE pool

describe("LpAccountV2_1", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(LpAccountV2_1.version).toBe(DEX_VERSION.v2_1);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(LpAccountV2_1.gasConstants.directAddLp).toMatchInlineSnapshot(
        "300000000n",
      );
      expect(LpAccountV2_1.gasConstants.refund).toMatchInlineSnapshot(
        "800000000n",
      );
      expect(LpAccountV2_1.gasConstants.resetGas).toMatchInlineSnapshot(
        "20000000n",
      );
    });
  });

  describe("constructor", () => {
    it("should create an instance of LpAccountV2_1", () => {
      const contract = LpAccountV2_1.create(LP_ACCOUNT_ADDRESS);

      expect(contract).toBeInstanceOf(LpAccountV2_1);
    });

    it("should create an instance of LpAccountV2_1 with default gasConstants", () => {
      const contract = LpAccountV2_1.create(LP_ACCOUNT_ADDRESS);

      expect(contract.gasConstants).toEqual(LpAccountV2_1.gasConstants);
    });

    it("should create an instance of LpAccountV2_1 with given gasConstants", () => {
      const gasConstants: Partial<LpAccountV2_1["gasConstants"]> = {
        refund: BigInt("1"),
        directAddLp: BigInt("2"),
        resetGas: BigInt("3"),
      };

      const contract = new LpAccountV2_1(LP_ACCOUNT_ADDRESS, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createRefundBody", () => {
    it("should build expected tx body", async () => {
      const contract = LpAccountV2_1.create(LP_ACCOUNT_ADDRESS);

      const body = await contract.createRefundBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADwAAGRMrmiwAAAAAAAAAACAs58M0"',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = LpAccountV2_1.create(LP_ACCOUNT_ADDRESS);

      const body = await contract.createRefundBody({
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADwAAGRMrmiwAAAAAAAAwOSD+KN1r"',
      );
    });
  });

  describe("getRefundTxParams", () => {
    const provider = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = provider.open(LpAccountV2_1.create(LP_ACCOUNT_ADDRESS));

      const params = await contract.getRefundTxParams();

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADwAAGRMrmiwAAAAAAAAAACAs58M0"',
      );
      expect(params.value).toBe(contract.gasConstants.refund);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(LpAccountV2_1.create(LP_ACCOUNT_ADDRESS));

      const params = await contract.getRefundTxParams({
        queryId: 12345,
      });

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADwAAGRMrmiwAAAAAAAAwOSD+KN1r"',
      );
      expect(params.value).toBe(contract.gasConstants.refund);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(LpAccountV2_1.create(LP_ACCOUNT_ADDRESS));

      const params = await contract.getRefundTxParams({
        gasAmount: "1",
      });

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADwAAGRMrmiwAAAAAAAAAACAs58M0"',
      );
      expect(params.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendRefund", () => {
    it("should call getRefundTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<LpAccountV2_1["sendRefund"]>[2];

      const contract = LpAccountV2_1.create(LP_ACCOUNT_ADDRESS);

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
      userWalletAddress: USER_WALLET_ADDRESS,
      amount0: "1000000000",
      amount1: "2000000000",
    };

    it("should build expected tx body", async () => {
      const contract = LpAccountV2_1.create(LP_ACCOUNT_ADDRESS);

      const body = await contract.createDirectAddLiquidityBody({
        ...txParams,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAgQABcQ/4v8YAAAAAAAAAAEO5rKAEdzWUABAQgAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNCAEAhYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaLnKlNw"',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = LpAccountV2_1.create(LP_ACCOUNT_ADDRESS);

      const body = await contract.createDirectAddLiquidityBody({
        ...txParams,
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAgQABcQ/4v8YAAAAAAAAwOUO5rKAEdzWUABAQgAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNCAEAhYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKJV2nG"',
      );
    });

    it("should build expected tx body when minimumLpToMint is defined", async () => {
      const contract = LpAccountV2_1.create(LP_ACCOUNT_ADDRESS);

      const body = await contract.createDirectAddLiquidityBody({
        ...txParams,
        minimumLpToMint: "300",
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAggABcw/4v8YAAAAAAAAAAEO5rKAEdzWUACASwIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQgBAIWAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmiY/MWkg=="',
      );
    });
  });

  describe("getDirectAddLiquidityTxParams", () => {
    const provider = createMockProvider();

    const txParams = {
      userWalletAddress: USER_WALLET_ADDRESS,
      amount0: "1",
      amount1: "2",
    };

    it("should build expected tx params", async () => {
      const contract = provider.open(LpAccountV2_1.create(LP_ACCOUNT_ADDRESS));

      const params = await contract.getDirectAddLiquidityTxParams({
        ...txParams,
      });

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAewABZQ/4v8YAAAAAAAAAABARAhAQgAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNCAEAhYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKkaNXm"',
      );
      expect(params.value).toBe(contract.gasConstants.directAddLp);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(LpAccountV2_1.create(LP_ACCOUNT_ADDRESS));

      const params = await contract.getDirectAddLiquidityTxParams({
        ...txParams,
        queryId: 12345,
      });

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAewABZQ/4v8YAAAAAAAAwORARAhAQgAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNCAEAhYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaK8SxWV"',
      );
      expect(params.value).toBe(contract.gasConstants.directAddLp);
    });

    it("should build expected tx params when minimumLpToMint is defined", async () => {
      const contract = provider.open(LpAccountV2_1.create(LP_ACCOUNT_ADDRESS));

      const params = await contract.getDirectAddLiquidityTxParams({
        ...txParams,
        minimumLpToMint: "3",
      });

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAewABZQ/4v8YAAAAAAAAAABARAhAwgAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNCAEAhYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaLcsB4N"',
      );
      expect(params.value).toBe(contract.gasConstants.directAddLp);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(LpAccountV2_1.create(LP_ACCOUNT_ADDRESS));

      const params = await contract.getDirectAddLiquidityTxParams({
        ...txParams,
        gasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQAAPP517U137Zx7xkNgzm662hGlxuL20iiQDRtwemhWTPLx"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAewABZQ/4v8YAAAAAAAAAABARAhAQgAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNCAEAhYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKkaNXm"',
      );
      expect(params.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendDirectAddLiquidity", () => {
    it("should call getDirectAddLiquidityTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<
        LpAccountV2_1["sendDirectAddLiquidity"]
      >[2];

      const contract = LpAccountV2_1.create(LP_ACCOUNT_ADDRESS);

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
      const contract = LpAccountV2_1.create(LP_ACCOUNT_ADDRESS);

      const body = await contract.createResetGasBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGCnSKTUAAAAAAAAAAI6H96U="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = LpAccountV2_1.create(LP_ACCOUNT_ADDRESS);

      const body = await contract.createResetGasBody({
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGCnSKTUAAAAAAAAwOXAH6K0="',
      );
    });
  });

  describe("getResetGasTxParams", () => {
    const provider = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = provider.open(LpAccountV2_1.create(LP_ACCOUNT_ADDRESS));

      const params = await contract.getResetGasTxParams();

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGCnSKTUAAAAAAAAAAI6H96U="',
      );
      expect(params.value).toBe(contract.gasConstants.resetGas);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(LpAccountV2_1.create(LP_ACCOUNT_ADDRESS));

      const params = await contract.getResetGasTxParams({
        queryId: 12345,
      });

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGCnSKTUAAAAAAAAwOXAH6K0="',
      );
      expect(params.value).toBe(contract.gasConstants.resetGas);
    });
  });

  describe("sendResetGas", () => {
    it("should call getResetGasTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<LpAccountV2_1["sendResetGas"]>[2];

      const contract = LpAccountV2_1.create(LP_ACCOUNT_ADDRESS);

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
          "te6cckEBAQEAJAAAQ4AcWjZMMl4PnV4hXc0bTXOnmOCQPE08nma5bszegFth3FBjJd6+",
        )
        .number("0")
        .number("0");

      const provider = createMockProviderFromSnapshot(snapshot);

      const contract = provider.open(LpAccountV2_1.create(LP_ACCOUNT_ADDRESS));

      const data = await contract.getLpAccountData();

      expect(data.userAddress).toMatchInlineSnapshot(
        '"EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i"',
      );
      expect(data.poolAddress).toMatchInlineSnapshot(
        '"EQDi0bJhkvB86vEK7mjaa508xwSB4mnk8zXLdmb0AtsO4iG7"',
      );
      expect(data.amount0).toMatchInlineSnapshot("0n");
      expect(data.amount1).toMatchInlineSnapshot("0n");
    });
  });
});
