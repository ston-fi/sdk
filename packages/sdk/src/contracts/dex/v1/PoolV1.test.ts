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
import { JettonWallet } from "../../core/JettonWallet";
import { DEX_VERSION } from "../constants";
import { LpAccountV1 } from "./LpAccountV1";
import { PoolV1 } from "./PoolV1";

const POOL_ADDRESS = "EQCl-ax-5QC06ub096s2bqTbhYZWigZ1-FkJm2IVIMSazp7U"; // STON/GEMSTON pool
const USER_WALLET_ADDRESS = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";

describe("PoolV1", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(PoolV1.version).toBe(DEX_VERSION.v1);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(PoolV1.gasConstants.burn).toMatchInlineSnapshot("500000000n");
      expect(PoolV1.gasConstants.collectFees).toMatchInlineSnapshot(
        "1100000000n",
      );
    });
  });

  describe("create", () => {
    it("should create an instance of PoolV1 from address", () => {
      const contract = PoolV1.create(POOL_ADDRESS);

      expect(contract).toBeInstanceOf(PoolV1);
    });
  });

  describe("constructor", () => {
    it("should create an instance of PoolV1", () => {
      const contract = PoolV1.create(POOL_ADDRESS);

      expect(contract).toBeInstanceOf(PoolV1);
    });

    it("should create an instance of PoolV1 with default gasConstants", () => {
      const contract = PoolV1.create(POOL_ADDRESS);

      expect(contract.gasConstants).toEqual(PoolV1.gasConstants);
    });

    it("should create an instance of PoolV1 with given gasConstants", () => {
      const gasConstants: Partial<PoolV1["gasConstants"]> = {
        burn: BigInt("1"),
        collectFees: BigInt("2"),
      };

      const contract = new PoolV1(POOL_ADDRESS, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createCollectFeesBody", () => {
    it("should build expected tx body", async () => {
      const contract = PoolV1.create(POOL_ADDRESS);

      const body = await contract.createCollectFeesBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB/LfT0AAAAAAAAAAOHc0mQ="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = PoolV1.create(POOL_ADDRESS);

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
      const contract = provider.open(PoolV1.create(POOL_ADDRESS));

      const txParams = await contract.getCollectFeeTxParams();

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQCl-ax-5QC06ub096s2bqTbhYZWigZ1-FkJm2IVIMSazp7U"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB/LfT0AAAAAAAAAAOHc0mQ="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1100000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(PoolV1.create(POOL_ADDRESS));

      const txParams = await contract.getCollectFeeTxParams({
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQCl-ax-5QC06ub096s2bqTbhYZWigZ1-FkJm2IVIMSazp7U"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB/LfT0AAAAAAAAwOR9czWw="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1100000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(PoolV1.create(POOL_ADDRESS));

      const txParams = await contract.getCollectFeeTxParams({
        gasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQCl-ax-5QC06ub096s2bqTbhYZWigZ1-FkJm2IVIMSazp7U"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB/LfT0AAAAAAAAAAOHc0mQ="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendCollectFees", () => {
    it("should call getCollectFeeTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<PoolV1["sendCollectFees"]>[2];

      const contract = PoolV1.create(POOL_ADDRESS);

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
    const txArgs = {
      amount: "1000000000",
      responseAddress: USER_WALLET_ADDRESS,
    };

    it("should build expected tx body", async () => {
      const contract = PoolV1.create(POOL_ADDRESS);

      const body = await contract.createBurnBody({
        ...txArgs,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEANAAAY1lfB7wAAAAAAAAAAEO5rKAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRhaz3TA=="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = PoolV1.create(POOL_ADDRESS);

      const body = await contract.createBurnBody({
        ...txArgs,
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEANAAAY1lfB7wAAAAAAAAwOUO5rKAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRGnDxRA=="',
      );
    });
  });

  describe("getBurnTxParams", () => {
    const txArgs = {
      amount: "1000000000",
      responseAddress: USER_WALLET_ADDRESS,
    };

    const getWalletAddressSnapshot = createProviderSnapshot().cell(
      "te6ccsEBAQEAJAAAAEOACstDZ3ATHWF//MUN1iK/rfVwlHFuhUxxdp3sB2jMtipQs2Cj5Q==",
    );

    const provider = createMockProviderFromSnapshot((address, method) => {
      if (address === POOL_ADDRESS && method === "get_wallet_address")
        return getWalletAddressSnapshot;

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(PoolV1.create(POOL_ADDRESS));

      const txParams = await contract.getBurnTxParams({
        ...txArgs,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBWWhs7gJjrC__mKG6xFf1vq4Sji3QqY4u072A7RmWxUoT1"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEANAAAY1lfB7wAAAAAAAAAAEO5rKAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRhaz3TA=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("500000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(PoolV1.create(POOL_ADDRESS));

      const txParams = await contract.getBurnTxParams({
        ...txArgs,
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBWWhs7gJjrC__mKG6xFf1vq4Sji3QqY4u072A7RmWxUoT1"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEANAAAY1lfB7wAAAAAAAAwOUO5rKAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRGnDxRA=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("500000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(PoolV1.create(POOL_ADDRESS));

      const txParams = await contract.getBurnTxParams({
        ...txArgs,
        gasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBWWhs7gJjrC__mKG6xFf1vq4Sji3QqY4u072A7RmWxUoT1"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEANAAAY1lfB7wAAAAAAAAAAEO5rKAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRhaz3TA=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendBurn", () => {
    it("should call getBurnTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<PoolV1["sendBurn"]>[2];

      const contract = PoolV1.create(POOL_ADDRESS);

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

  describe("getExpectedOutputs", () => {
    const snapshot = createProviderSnapshot()
      .number("78555061853")
      .number("78633696")
      .number("0");
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(PoolV1.create(POOL_ADDRESS));

      const data = await contract.getExpectedOutputs({
        amount: "1000000000",
        jettonWallet:
          "0:87b92241aa6a57df31271460c109c54dfd989a1aea032f6107d2c65d6e8879ce", // token0WalletAddress
      });

      expect(data.jettonToReceive).toMatchInlineSnapshot("78555061853n");
      expect(data.protocolFeePaid).toMatchInlineSnapshot("78633696n");
      expect(data.refFeePaid).toMatchInlineSnapshot("0n");
    });
  });

  describe("getExpectedTokens", () => {
    const snapshot = createProviderSnapshot().number("19");
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(PoolV1.create(POOL_ADDRESS));

      const data = await contract.getExpectedTokens({
        amount0: "100000",
        amount1: "200000",
      });

      expect(data).toMatchInlineSnapshot("19n");
    });
  });

  describe("getExpectedLiquidity", () => {
    const snapshot = createProviderSnapshot().number("128").number("10128");
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(PoolV1.create(POOL_ADDRESS));

      const data = await contract.getExpectedLiquidity({
        jettonAmount: "1",
      });

      expect(data.amount0).toMatchInlineSnapshot("128n");
      expect(data.amount1).toMatchInlineSnapshot("10128n");
    });
  });

  describe("getLpAccountAddress", () => {
    const ownerAddress = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";

    const snapshot = createProviderSnapshot().cell(
      "te6ccsEBAQEAJAAAAEOAH6VkyTu5g20HTCbGu1/OTfiBSIoSdeKMzW42GndI90LQv9OlMw==",
    );
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(PoolV1.create(POOL_ADDRESS));

      const data = await contract.getLpAccountAddress({
        ownerAddress,
      });

      expect(data).toMatchInlineSnapshot(
        '"EQD9KyZJ3cwbaDphNjXa_nJvxApEUJOvFGZrcbDTuke6Fs7B"',
      );
    });
  });

  describe("getJettonWallet", () => {
    const userJettonWalletAddress =
      "EQCvlCQ1FP0oaq_-8UK9HlkKeN88DIbJRSJ6BcPEXza9_ikZ"; // jetton wallet address of STON/GEMSTON pool jetton for USER_WALLET_ADDRESS

    it("should create JettonWallet contract instance for USER_WALLET_ADDRESS", async () => {
      const contract = PoolV1.create(POOL_ADDRESS);

      const getWalletAddress = vi.spyOn(contract, "getWalletAddress");
      getWalletAddress.mockResolvedValue(toAddress(userJettonWalletAddress));

      const provider = createMockProvider();

      const jettonWallet = await contract.getJettonWallet(provider, {
        ownerAddress: USER_WALLET_ADDRESS,
      });

      expect(getWalletAddress).toHaveBeenCalledWith(
        provider,
        USER_WALLET_ADDRESS,
      );
      expect(jettonWallet).toBeInstanceOf(JettonWallet);
      expect(jettonWallet.address.toString()).toEqual(userJettonWalletAddress);
    });
  });

  describe("getLpAccount", () => {
    const userLpAccountAddress =
      "EQD9KyZJ3cwbaDphNjXa_nJvxApEUJOvFGZrcbDTuke6Fs7B"; // lpAccount address of STON/GEMSTON pool jetton for USER_WALLET_ADDRESS

    it("should create LpAccount contract instance with defined address", async () => {
      const contract = PoolV1.create(POOL_ADDRESS);

      const getLpAccountAddress = vi.spyOn(contract, "getLpAccountAddress");
      getLpAccountAddress.mockResolvedValue(toAddress(userLpAccountAddress));

      const params = {
        ownerAddress: USER_WALLET_ADDRESS,
      };

      const provider = createMockProvider();

      const lpAccount = await contract.getLpAccount(provider, params);

      expect(getLpAccountAddress).toHaveBeenCalledWith(provider, params);
      expect(lpAccount).toBeInstanceOf(LpAccountV1);
      expect(lpAccount.address.toString()).toEqual(userLpAccountAddress);
    });
  });

  describe("getPoolData", () => {
    const snapshot = createProviderSnapshot()
      .number("14659241047997")
      .number("1155098971931369")
      .cell(
        "te6ccsEBAQEAJAAAAEOAEPckSDVNSvvmJOKMGCE4qb+zE0NdQGXsIPpYy63RDznQToI/Aw==",
      )
      .cell(
        "te6ccsEBAQEAJAAAAEOAE+qvh8EqMXFOd5n96sMS0GVGtkQdC74+zQaWQuG2G/lwYlQIaw==",
      )
      .number("20")
      .number("10")
      .number("10")
      .cell(
        "te6ccsEBAQEAJAAAAEOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQvWZ7LQ==",
      )
      .number("71678297602")
      .number("3371928931127");
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(PoolV1.create(POOL_ADDRESS));

      const data = await contract.getPoolData();

      expect(data.reserve0).toMatchInlineSnapshot("14659241047997n");
      expect(data.reserve1).toMatchInlineSnapshot("1155098971931369n");
      expect(data.token0WalletAddress).toMatchInlineSnapshot(
        '"EQCHuSJBqmpX3zEnFGDBCcVN_ZiaGuoDL2EH0sZdboh5zkwy"',
      );
      expect(data.token1WalletAddress).toMatchInlineSnapshot(
        '"EQCfVXw-CVGLinO8z-9WGJaDKjWyIOhd8fZoNLIXDbDfy2kw"',
      );
      expect(data.lpFee).toMatchInlineSnapshot("20n");
      expect(data.protocolFee).toMatchInlineSnapshot("10n");
      expect(data.refFee).toMatchInlineSnapshot("10n");
      expect(data.protocolFeeAddress).toMatchInlineSnapshot(
        '"EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c"',
      );
      expect(data.collectedToken0ProtocolFee).toMatchInlineSnapshot(
        "71678297602n",
      );
      expect(data.collectedToken1ProtocolFee).toMatchInlineSnapshot(
        "3371928931127n",
      );
    });
  });
});
