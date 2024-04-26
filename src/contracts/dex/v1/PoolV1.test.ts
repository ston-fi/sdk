import TonWeb from "tonweb";
import { describe, it, expect, vi } from "vitest";

import { createMockObj } from "@/test-utils";

import { DEX_VERSION } from "../constants";

import { PoolV1 } from "./PoolV1";

const {
  utils: { BN, bytesToBase64, base64ToBytes },
  boc: { Cell },
  Address,
} = TonWeb;

const POOL_ADDRESS = "EQCl-ax-5QC06ub096s2bqTbhYZWigZ1-FkJm2IVIMSazp7U"; // STON/GEMSTON pool
const USER_WALLET_ADDRESS = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";

const DEPENDENCIES = {
  address: POOL_ADDRESS,
  tonApiClient: createMockObj<InstanceType<typeof TonWeb.HttpProvider>>(),
};

describe("PoolV1", () => {
  describe("version", () => {
    it("should have expected static value", () => {
      expect(PoolV1.version).toBe(DEX_VERSION.v1);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(PoolV1.gasConstants).toMatchInlineSnapshot(`
        {
          "burn": "1dcd6500",
          "collectFees": "4190ab00",
        }
      `);
    });
  });

  describe("constructor", () => {
    it("should create an instance of PoolV1", () => {
      const contract = new PoolV1({
        ...DEPENDENCIES,
      });

      expect(contract).toBeInstanceOf(PoolV1);
    });

    it("should create an instance of PoolV1 with default gasConstants", () => {
      const contract = new PoolV1({
        ...DEPENDENCIES,
      });

      expect(contract.gasConstants).toEqual(PoolV1.gasConstants);
    });

    it("should create an instance of PoolV1 with given gasConstants", () => {
      const gasConstants: Partial<PoolV1["gasConstants"]> = {
        burn: new BN("1"),
        collectFees: new BN("2"),
      };

      const contract = new PoolV1({
        ...DEPENDENCIES,
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createCollectFeesBody", () => {
    it("should build expected tx body", async () => {
      const contract = new PoolV1({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const body = await contract.createCollectFeesBody();

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgfy309AAAAAAAAAAA6Ha+R"',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = new PoolV1({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const body = await contract.createCollectFeesBody({
        queryId: 12345,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgfy309AAAAAAAAMDnEnbCZ"',
      );
    });
  });

  describe("buildCollectFeeTxParams", () => {
    it("should build expected tx params", async () => {
      const contract = new PoolV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildCollectFeeTxParams();

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQCl-ax-5QC06ub096s2bqTbhYZWigZ1-FkJm2IVIMSazp7U"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        `"te6ccsEBAQEADgAAABgfy309AAAAAAAAAAA6Ha+R"`,
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"4190ab00"');
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new PoolV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildCollectFeeTxParams({
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQCl-ax-5QC06ub096s2bqTbhYZWigZ1-FkJm2IVIMSazp7U"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        `"te6ccsEBAQEADgAAABgfy309AAAAAAAAMDnEnbCZ"`,
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"4190ab00"');
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = new PoolV1({
        ...DEPENDENCIES,
      });

      const params = await contract.buildCollectFeeTxParams({
        gasAmount: new BN("1"),
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQCl-ax-5QC06ub096s2bqTbhYZWigZ1-FkJm2IVIMSazp7U"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgfy309AAAAAAAAAAA6Ha+R"',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"01"');
    });
  });

  describe("createBurnBody", () => {
    const txParams = {
      amount: new BN("1000000000"),
      responseAddress: USER_WALLET_ADDRESS,
    };

    it("should build expected tx body", async () => {
      const contract = new PoolV1({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const body = await contract.createBurnBody({
        ...txParams,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEANAAAAGNZXwe8AAAAAAAAAABDuaygCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0VbwhWI="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = new PoolV1({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const body = await contract.createBurnBody({
        ...txParams,
        queryId: 12345,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEANAAAAGNZXwe8AAAAAAAAMDlDuaygCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0cksg2o="',
      );
    });
  });

  describe("buildBurnTxParams", () => {
    const txParams = {
      amount: new BN("1000000000"),
      responseAddress: USER_WALLET_ADDRESS,
    };

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn(async (...args) => {
        if (args[0] === POOL_ADDRESS && args[1] === "get_wallet_address") {
          return Cell.oneFromBoc(
            base64ToBytes(
              "te6ccsEBAQEAJAAAAEOACstDZ3ATHWF//MUN1iK/rfVwlHFuhUxxdp3sB2jMtipQs2Cj5Q==",
            ),
          );
        }

        throw new Error(`Unexpected call2: ${args}`);
      }),
    });

    it("should build expected tx params", async () => {
      const contract = new PoolV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildBurnTxParams({
        ...txParams,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBWWhs7gJjrC__mKG6xFf1vq4Sji3QqY4u072A7RmWxUoT1"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEANAAAAGNZXwe8AAAAAAAAAABDuaygCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0VbwhWI="',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"1dcd6500"');
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new PoolV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildBurnTxParams({
        ...txParams,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBWWhs7gJjrC__mKG6xFf1vq4Sji3QqY4u072A7RmWxUoT1"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEANAAAAGNZXwe8AAAAAAAAMDlDuaygCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0cksg2o="',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"1dcd6500"');
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = new PoolV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildBurnTxParams({
        ...txParams,
        gasAmount: new BN("1"),
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBWWhs7gJjrC__mKG6xFf1vq4Sji3QqY4u072A7RmWxUoT1"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEANAAAAGNZXwe8AAAAAAAAAABDuaygCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0VbwhWI="',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"01"');
    });
  });

  describe("getExpectedOutputs", () => {
    const snapshot = [new BN("78555061853"), new BN("78633696"), new BN("0")];

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn().mockResolvedValue(snapshot),
    });

    it("should make on-chain request and return parsed response", async () => {
      const contract = new PoolV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const data = await contract.getExpectedOutputs({
        amount: new BN("1000000000"),
        jettonWallet:
          "0:87b92241aa6a57df31271460c109c54dfd989a1aea032f6107d2c65d6e8879ce", // token0WalletAddress
      });

      expect(data.jettonToReceive).toStrictEqual(snapshot[0]);
      expect(data.protocolFeePaid).toStrictEqual(snapshot[1]);
      expect(data.refFeePaid).toStrictEqual(snapshot[2]);
    });
  });

  describe("getExpectedTokens", () => {
    const snapshot = new BN("19");

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn().mockResolvedValue(snapshot),
    });

    it("should make on-chain request and return parsed response", async () => {
      const contract = new PoolV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const data = await contract.getExpectedTokens({
        amount0: new BN("100000"),
        amount1: new BN("200000"),
      });

      expect(data).toStrictEqual(snapshot);
    });
  });

  describe("getExpectedLiquidity", () => {
    const snapshot = [new BN("128"), new BN("10128")];

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn().mockResolvedValue(snapshot),
    });

    it("should make on-chain request and return parsed response", async () => {
      const contract = new PoolV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const data = await contract.getExpectedLiquidity({
        jettonAmount: new BN("1"),
      });

      expect(data.amount0).toStrictEqual(snapshot[0]);
      expect(data.amount1).toStrictEqual(snapshot[1]);
    });
  });

  describe("getLpAccountAddress", () => {
    const ownerAddress = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";

    const snapshot = Cell.oneFromBoc(
      base64ToBytes(
        "te6ccsEBAQEAJAAAAEOAH6VkyTu5g20HTCbGu1/OTfiBSIoSdeKMzW42GndI90LQv9OlMw==",
      ),
    );

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn().mockResolvedValue(snapshot),
    });

    it("should make on-chain request and return parsed response", async () => {
      const contract = new PoolV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const data = await contract.getLpAccountAddress({
        ownerAddress,
      });

      expect(data).toStrictEqual(
        new Address(
          "0:fd2b2649ddcc1b683a613635dafe726fc40a445093af14666b71b0d3ba47ba16",
        ),
      );
    });
  });

  describe("getData", () => {
    const snapshot = [
      new BN("14659241047997"),
      new BN("1155098971931369"),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsEBAQEAJAAAAEOAEPckSDVNSvvmJOKMGCE4qb+zE0NdQGXsIPpYy63RDznQToI/Aw==",
        ),
      ),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsEBAQEAJAAAAEOAE+qvh8EqMXFOd5n96sMS0GVGtkQdC74+zQaWQuG2G/lwYlQIaw==",
        ),
      ),
      new BN("20"),
      new BN("10"),
      new BN("10"),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsEBAQEAJAAAAEOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQvWZ7LQ==",
        ),
      ),
      new BN("71678297602"),
      new BN("3371928931127"),
    ];

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn().mockResolvedValue(snapshot),
    });

    it("should make on-chain request and return parsed response", async () => {
      const contract = new PoolV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const data = await contract.getData();

      expect(data.reserve0).toStrictEqual(snapshot[0]);
      expect(data.reserve1).toStrictEqual(snapshot[1]);
      expect(data.token0WalletAddress).toStrictEqual(
        new Address(
          "0:87b92241aa6a57df31271460c109c54dfd989a1aea032f6107d2c65d6e8879ce",
        ),
      );
      expect(data.token1WalletAddress).toStrictEqual(
        new Address(
          "0:9f557c3e09518b8a73bccfef561896832a35b220e85df1f66834b2170db0dfcb",
        ),
      );
      expect(data.lpFee).toStrictEqual(snapshot[4]);
      expect(data.protocolFee).toStrictEqual(snapshot[5]);
      expect(data.refFee).toStrictEqual(snapshot[6]);
      expect(data.protocolFeeAddress).toBeNull();
      expect(data.collectedToken0ProtocolFee).toStrictEqual(snapshot[8]);
      expect(data.collectedToken1ProtocolFee).toStrictEqual(snapshot[9]);
    });
  });
});
