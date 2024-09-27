import { beforeAll, describe, expect, it, vi } from "vitest";
import { Address, type Sender } from "@ton/ton";

import {
  createMockObj,
  createMockProvider,
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "@/test-utils";
import { toAddress } from "@/utils/toAddress";
import { JettonWallet } from "@/contracts/core/JettonWallet";

import { LpAccountV2_1 } from "../LpAccount/LpAccountV2_1";
import { DEX_TYPE, DEX_VERSION } from "../../constants";

import { BasePoolV2_1 } from "./BasePoolV2_1";

const USER_WALLET_ADDRESS = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";
const POOL_ADDRESS = "kQDZVuwLe9I6XjZrnm3txQyEHuV5RcwlSRVHpqiutLsw6HR7"; // TestRED/TestBLUE pool

describe("BasePoolV2_1", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(BasePoolV2_1.version).toBe(DEX_VERSION.v2_1);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(BasePoolV2_1.gasConstants.burn).toMatchInlineSnapshot(
        "800000000n",
      );
      expect(BasePoolV2_1.gasConstants.collectFees).toMatchInlineSnapshot(
        "400000000n",
      );
    });
  });

  describe("constructor", () => {
    it("should create an instance of BasePoolV2_1", () => {
      const contract = BasePoolV2_1.create(POOL_ADDRESS);

      expect(contract).toBeInstanceOf(BasePoolV2_1);
    });

    it("should create an instance of BasePoolV2_1 with default gasConstants", () => {
      const contract = BasePoolV2_1.create(POOL_ADDRESS);

      expect(contract.gasConstants).toEqual(BasePoolV2_1.gasConstants);
    });

    it("should create an instance of BasePoolV2_1 with given gasConstants", () => {
      const gasConstants: Partial<BasePoolV2_1["gasConstants"]> = {
        burn: BigInt("1"),
        collectFees: BigInt("2"),
      };

      const contract = new BasePoolV2_1(POOL_ADDRESS, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createCollectFeesBody", () => {
    it("should build expected tx body", async () => {
      const contract = BasePoolV2_1.create(POOL_ADDRESS);

      const body = await contract.createCollectFeesBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB7kkR4AAAAAAAAAAPr6RWc="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = BasePoolV2_1.create(POOL_ADDRESS);

      const body = await contract.createCollectFeesBody({
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB7kkR4AAAAAAAAwOQR6Wm8="',
      );
    });
  });

  describe("getCollectFeeTxParams", () => {
    const provider = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = provider.open(BasePoolV2_1.create(POOL_ADDRESS));

      const params = await contract.getCollectFeeTxParams();

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQDZVuwLe9I6XjZrnm3txQyEHuV5RcwlSRVHpqiutLsw6M_x"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB7kkR4AAAAAAAAAAPr6RWc="',
      );
      expect(params.value).toMatchInlineSnapshot("400000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BasePoolV2_1.create(POOL_ADDRESS));

      const params = await contract.getCollectFeeTxParams({
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQDZVuwLe9I6XjZrnm3txQyEHuV5RcwlSRVHpqiutLsw6M_x"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB7kkR4AAAAAAAAwOQR6Wm8="',
      );
      expect(params.value).toMatchInlineSnapshot("400000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(BasePoolV2_1.create(POOL_ADDRESS));

      const params = await contract.getCollectFeeTxParams({
        gasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQDZVuwLe9I6XjZrnm3txQyEHuV5RcwlSRVHpqiutLsw6M_x"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB7kkR4AAAAAAAAAAPr6RWc="',
      );
      expect(params.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendCollectFees", () => {
    it("should call getCollectFeeTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<BasePoolV2_1["sendCollectFees"]>[2];

      const contract = BasePoolV2_1.create(POOL_ADDRESS);

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
      const contract = BasePoolV2_1.create(POOL_ADDRESS);

      const body = await contract.createBurnBody({
        ...txParams,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEwAAIVlfB7wAAAAAAAAAAEO5rKABu8koZQ=="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = BasePoolV2_1.create(POOL_ADDRESS);

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
      if (
        address === Address.normalize(POOL_ADDRESS) &&
        method === "get_wallet_address"
      )
        return createProviderSnapshot().cell(
          "te6cckEBAQEAJAAAQ4ATs+bqKCw4DAFCBzMdP48shi7M2sbD6VRgGksjnmLsO1CK5a4W",
        );

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(BasePoolV2_1.create(POOL_ADDRESS));

      const params = await contract.getBurnTxParams({
        ...txParams,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQCdnzdRQWHAYAoQOZjp_HlkMXZm1jYfSqMA0lkc8xdh2lF-"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEwAAIVlfB7wAAAAAAAAAAEO5rKABu8koZQ=="',
      );
      expect(params.value).toMatchInlineSnapshot("800000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BasePoolV2_1.create(POOL_ADDRESS));

      const params = await contract.getBurnTxParams({
        ...txParams,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQCdnzdRQWHAYAoQOZjp_HlkMXZm1jYfSqMA0lkc8xdh2lF-"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEwAAIVlfB7wAAAAAAAAwOUO5rKABFeXmDg=="',
      );
      expect(params.value).toMatchInlineSnapshot("800000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(BasePoolV2_1.create(POOL_ADDRESS));

      const params = await contract.getBurnTxParams({
        ...txParams,
        gasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQCdnzdRQWHAYAoQOZjp_HlkMXZm1jYfSqMA0lkc8xdh2lF-"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAEwAAIVlfB7wAAAAAAAAAAEO5rKABu8koZQ=="',
      );
      expect(params.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendBurn", () => {
    it("should call getBurnTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<BasePoolV2_1["sendBurn"]>[2];

      const contract = BasePoolV2_1.create(POOL_ADDRESS);

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

  describe("getLpAccountAddress", () => {
    const ownerAddress = USER_WALLET_ADDRESS;

    const snapshot = createProviderSnapshot().cell(
      "te6cckEBAQEAJAAAQ4AVCq1wcAqyiCdZCD0uy2zlKSKJURP53P8BGQXdhxOazjC3iKkE",
    );
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(BasePoolV2_1.create(POOL_ADDRESS));

      const data = await contract.getLpAccountAddress({
        ownerAddress,
      });

      expect(data).toMatchInlineSnapshot(
        '"EQCoVWuDgFWUQTrIQel2W2cpSRRKiJ_O5_gIyC7sOJzWcfJk"',
      );
    });
  });

  describe("getJettonWallet", () => {
    const userJettonWalletAddress =
      "EQCdnzdRQWHAYAoQOZjp_HlkMXZm1jYfSqMA0lkc8xdh2lF-";

    it("should create JettonWallet contract instance for USER_WALLET_ADDRESS", async () => {
      const contract = BasePoolV2_1.create(POOL_ADDRESS);

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
      "EQCoVWuDgFWUQTrIQel2W2cpSRRKiJ_O5_gIyC7sOJzWcfJk";

    it("should create LpAccount contract instance with defined address", async () => {
      const contract = BasePoolV2_1.create(POOL_ADDRESS);

      const getLpAccountAddress = vi.spyOn(contract, "getLpAccountAddress");
      getLpAccountAddress.mockResolvedValue(toAddress(userLpAccountAddress));

      const params = {
        ownerAddress: USER_WALLET_ADDRESS,
      };

      const provider = createMockProvider();

      const lpAccount = await contract.getLpAccount(provider, params);

      expect(getLpAccountAddress).toHaveBeenCalledWith(provider, params);
      expect(lpAccount).toBeInstanceOf(LpAccountV2_1);
      expect(lpAccount.address.toString()).toEqual(userLpAccountAddress);
    });
  });

  describe("getPoolType", () => {
    const snapshot = createProviderSnapshot().cell(
      "te6cckEBAQEAEgAAIGNvbnN0YW50X3Byb2R1Y3Svg+BE",
    );
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(BasePoolV2_1.create(POOL_ADDRESS));

      const type = await contract.getPoolType();

      expect(type).toStrictEqual(DEX_TYPE.CPI);
    });
  });

  describe("getPoolData", () => {
    const snapshot = createProviderSnapshot()
      .number("0")
      .cell(
        "te6cckEBAQEAJAAAQ4ABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1DQHKwZ",
      )
      .number("1283510854219")
      .number("912514867886")
      .number("1814983635223")
      .cell(
        "te6cckEBAQEAJAAAQ4AbODBzUaSK5j0GzCBQi97jKeks860gYcTemIQLL7ZKxZD8mj8B",
      )
      .cell(
        "te6cckEBAQEAJAAAQ4AOHVtw9k5i6efu1Ofm2mbqbMyLChv0FZFYxaypjToz1nAgGr6p",
      )
      .number("20")
      .number("10")
      .cell("te6cckEBAQEAAwAAASCUQYZV")
      .number("2423145")
      .number("9827851");
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(BasePoolV2_1.create(POOL_ADDRESS));

      const data = await contract.getPoolData();

      expect(data.isLocked).toBe(false);
      expect(data.routerAddress).toMatchInlineSnapshot(
        '"EQALh-JBBIKK7gr0o4AVf9JZnEsFndqO0qTCyT-D-yBsWval"',
      );
      expect(data.totalSupplyLP).toMatchInlineSnapshot("1283510854219n");
      expect(data.reserve0).toMatchInlineSnapshot("912514867886n");
      expect(data.reserve1).toMatchInlineSnapshot("1814983635223n");
      expect(data.token0WalletAddress).toMatchInlineSnapshot(
        '"EQDZwYOajSRXMeg2YQKEXvcZT0lnnWkDDib0xCBZfbJWLBpD"',
      );
      expect(data.token1WalletAddress).toMatchInlineSnapshot(
        '"EQBw6tuHsnMXTz92pz820zdTZmRYUN-grIrGLWVMadGes4-9"',
      );
      expect(data.lpFee).toMatchInlineSnapshot("20n");
      expect(data.protocolFee).toMatchInlineSnapshot("10n");
      expect(data.protocolFeeAddress).toMatchInlineSnapshot("null");
      expect(data.collectedToken0ProtocolFee).toMatchInlineSnapshot("2423145n");
      expect(data.collectedToken1ProtocolFee).toMatchInlineSnapshot("9827851n");
    });
  });
});
