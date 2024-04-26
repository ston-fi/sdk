import TonWeb from "tonweb";
import { describe, it, expect, vi } from "vitest";

import { createMockObj } from "@/test-utils";

import { DEX_VERSION } from "../constants";

import { LpAccountV1 } from "./LpAccountV1";

const {
  utils: { BN, bytesToBase64, base64ToBytes },
  boc: { Cell },
  Address,
} = TonWeb;

const LP_ACCOUNT_ADDRESS = "EQD9KyZJ3cwbaDphNjXa_nJvxApEUJOvFGZrcbDTuke6Fs7B"; // LP account of `UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn` wallet for STON/GEMSTON pool

const DEPENDENCIES = {
  address: LP_ACCOUNT_ADDRESS,
  tonApiClient: createMockObj<InstanceType<typeof TonWeb.HttpProvider>>(),
};

describe("LpAccountV1", () => {
  describe("version", () => {
    it("should have expected static value", () => {
      expect(LpAccountV1.version).toBe(DEX_VERSION.v1);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(LpAccountV1.gasConstants).toMatchInlineSnapshot(`
        {
          "directAddLp": "11e1a300",
          "refund": "11e1a300",
          "resetGas": "11e1a300",
        }
      `);
    });
  });

  describe("constructor", () => {
    it("should create an instance of LpAccountV1", () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      expect(contract).toBeInstanceOf(LpAccountV1);
    });

    it("should create an instance of LpAccountV1 with default gasConstants", () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      expect(contract.gasConstants).toEqual(LpAccountV1.gasConstants);
    });

    it("should create an instance of LpAccountV1 with given gasConstants", () => {
      const gasConstants: Partial<LpAccountV1["gasConstants"]> = {
        refund: new BN("1"),
        directAddLp: new BN("2"),
        resetGas: new BN("3"),
      };

      const contract = new LpAccountV1({
        ...DEPENDENCIES,
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createRefundBody", () => {
    it("should build expected tx body", async () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const body = await contract.createRefundBody();

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgL8/RHAAAAAAAAAAALaWHr"',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const body = await contract.createRefundBody({
        queryId: 12345,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgL8/RHAAAAAAAAMDn16X7j"',
      );
    });
  });

  describe("buildRefundTxParams", () => {
    it("should build expected tx params", async () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildRefundTxParams();

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        `"te6ccsEBAQEADgAAABgL8/RHAAAAAAAAAAALaWHr"`,
      );
      expect(params.gasAmount).toBe(contract.gasConstants.refund);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildRefundTxParams({
        queryId: 12345,
      });

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        `"te6ccsEBAQEADgAAABgL8/RHAAAAAAAAMDn16X7j"`,
      );
      expect(params.gasAmount).toBe(contract.gasConstants.refund);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildRefundTxParams({
        gasAmount: new BN("1"),
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQD9KyZJ3cwbaDphNjXa_nJvxApEUJOvFGZrcbDTuke6Fs7B"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        `"te6ccsEBAQEADgAAABgL8/RHAAAAAAAAAAALaWHr"`,
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"01"');
    });
  });

  describe("createDirectAddLiquidityBody", () => {
    const txParams = {
      amount0: new BN("1000000000"),
      amount1: new BN("2000000000"),
    };

    it("should build expected tx body", async () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const body = await contract.createDirectAddLiquidityBody({
        ...txParams,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAGQAAAC1M+CgDAAAAAAAAAABDuaygBHc1lAAQGKuL7BM="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const body = await contract.createDirectAddLiquidityBody({
        ...txParams,
        queryId: 12345,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAGQAAAC1M+CgDAAAAAAAAMDlDuaygBHc1lAAQGBrHvII="',
      );
    });

    it("should build expected tx body when minimumLpToMint is defined", async () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const body = await contract.createDirectAddLiquidityBody({
        ...txParams,
        minimumLpToMint: new BN("300"),
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAGgAAAC9M+CgDAAAAAAAAAABDuaygBHc1lAAgEsggFqZK"',
      );
    });
  });

  describe("buildDirectAddLiquidityTxParams", () => {
    const txParams = {
      amount0: new BN("1"),
      amount1: new BN("2"),
    };

    it("should build expected tx params", async () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildDirectAddLiquidityTxParams({
        ...txParams,
      });

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        `"te6ccsEBAQEAEwAAACFM+CgDAAAAAAAAAAAQEQIQGCRdgzI="`,
      );
      expect(params.gasAmount).toBe(contract.gasConstants.directAddLp);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildDirectAddLiquidityTxParams({
        ...txParams,
        queryId: 12345,
      });

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        `"te6ccsEBAQEAEwAAACFM+CgDAAAAAAAAMDkQEQIQGIpxTVk="`,
      );
      expect(params.gasAmount).toBe(contract.gasConstants.directAddLp);
    });

    it("should build expected tx params when minimumLpToMint is defined", async () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildDirectAddLiquidityTxParams({
        ...txParams,
        minimumLpToMint: new BN("3"),
      });

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        `"te6ccsEBAQEAEwAAACFM+CgDAAAAAAAAAAAQEQIQOPrTPhI="`,
      );
      expect(params.gasAmount).toBe(contract.gasConstants.directAddLp);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildDirectAddLiquidityTxParams({
        ...txParams,
        gasAmount: new BN("1"),
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQD9KyZJ3cwbaDphNjXa_nJvxApEUJOvFGZrcbDTuke6Fs7B"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEwAAACFM+CgDAAAAAAAAAAAQEQIQGCRdgzI="',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"01"');
    });
  });

  describe("createResetGasBody", () => {
    it("should build expected tx body", async () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const body = await contract.createResetGasBody();

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABhCoPtDAAAAAAAAAAAs/PtB"',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const body = await contract.createResetGasBody({
        queryId: 12345,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABhCoPtDAAAAAAAAMDnSfORJ"',
      );
    });
  });

  describe("buildResetGasTxParams", () => {
    it("should build expected tx params", async () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildResetGasTxParams();

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        `"te6ccsEBAQEADgAAABhCoPtDAAAAAAAAAAAs/PtB"`,
      );
      expect(params.gasAmount).toBe(contract.gasConstants.resetGas);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new LpAccountV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildResetGasTxParams({
        queryId: 12345,
      });

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        `"te6ccsEBAQEADgAAABhCoPtDAAAAAAAAMDnSfORJ"`,
      );
      expect(params.gasAmount).toBe(contract.gasConstants.resetGas);
    });
  });

  describe("getData", () => {
    it("should make on-chain request and return parsed response", async () => {
      const snapshot = [
        Cell.oneFromBoc(
          base64ToBytes(
            "te6ccsEBAQEAJAAAAEOAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QY+4g6g==",
          ),
        ),
        Cell.oneFromBoc(
          base64ToBytes(
            "te6ccsEBAQEAJAAAAEOAFL81j9ygFp1c3p71Zs3Um3CwytFAzr8LITNsQqQYk1nQDFEwYA==",
          ),
        ),
        new BN("0"),
        new BN("0"),
      ];

      const contract = new LpAccountV1({
        ...DEPENDENCIES,
        tonApiClient: createMockObj<InstanceType<typeof TonWeb.HttpProvider>>({
          call2: vi.fn().mockResolvedValue(snapshot),
        }),
      });

      const data = await contract.getData();

      expect(data.userAddress).toStrictEqual(
        new Address(
          "0:109f12ea957d81eb0e23433cf33d603c7b2599559073e98d03ffc9e80112ce68",
        ),
      );
      expect(data.poolAddress).toStrictEqual(
        new Address(
          "0:a5f9ac7ee500b4eae6f4f7ab366ea4db8586568a0675f859099b621520c49ace",
        ),
      );
      expect(data.amount0).toBe(snapshot[2]);
      expect(data.amount1).toBe(snapshot[3]);
    });
  });
});
