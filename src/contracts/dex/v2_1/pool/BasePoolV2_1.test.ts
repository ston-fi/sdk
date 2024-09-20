import { beforeAll, describe, expect, it, vi } from "vitest";
import type { Sender } from "@ton/ton";

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
const POOL_ADDRESS = "EQDi0bJhkvB86vEK7mjaa508xwSB4mnk8zXLdmb0AtsO4iG7"; // TestRED/TestBLUE pool

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
        '"EQDi0bJhkvB86vEK7mjaa508xwSB4mnk8zXLdmb0AtsO4iG7"',
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
        '"EQDi0bJhkvB86vEK7mjaa508xwSB4mnk8zXLdmb0AtsO4iG7"',
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
        '"EQDi0bJhkvB86vEK7mjaa508xwSB4mnk8zXLdmb0AtsO4iG7"',
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
      if (address === POOL_ADDRESS && method === "get_wallet_address")
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOACstDZ3ATHWF//MUN1iK/rfVwlHFuhUxxdp3sB2jMtipQs2Cj5Q==",
        );

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(BasePoolV2_1.create(POOL_ADDRESS));

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
      const contract = provider.open(BasePoolV2_1.create(POOL_ADDRESS));

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
      const contract = provider.open(BasePoolV2_1.create(POOL_ADDRESS));

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
      "te6cckEBAQEAJAAAQ4AAB5/Ovamu/bOPeMhsGc3XW0I0uNxe2kUSAaNuD00KyZBJLKC6",
    );
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(BasePoolV2_1.create(POOL_ADDRESS));

      const data = await contract.getLpAccountAddress({
        ownerAddress,
      });

      expect(data).toMatchInlineSnapshot(
        '"EQAAPP517U137Zx7xkNgzm662hGlxuL20iiQDRtwemhWTPLx"',
      );
    });
  });

  describe("getJettonWallet", () => {
    const userJettonWalletAddress =
      "EQD5SDeFVvz8HjVZiwgxLR6UugyJxrSzAGztgGokzVyOD5pV";

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
      "EQAAPP517U137Zx7xkNgzm662hGlxuL20iiQDRtwemhWTPLx";

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
        "te6cckEBAQEAJAAAQ4ATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAq9P4f",
      )
      .number("4986244178")
      .number("4408450497")
      .number("5646981229")
      .cell(
        "te6cckEBAQEAJAAAQ4AFImSaUo+dFf1OYl8dtYp9Zj6M0s4JKV4Dgg9WfZm54vCRWjIN",
      )
      .cell(
        "te6cckEBAQEAJAAAQ4ATmaZ7TLWAsPlzzyZBHUychwiCFGUXrTsOROB1sQcwtxDOko/O",
      )
      .number("20")
      .number("10")
      .cell("te6cckEBAQEAAwAAASCUQYZV")
      .number("2519317")
      .number("514527");
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(BasePoolV2_1.create(POOL_ADDRESS));

      const data = await contract.getPoolData();

      expect(data.isLocked).toBe(false);
      expect(data.routerAddress).toMatchInlineSnapshot(
        '"EQCas2p939ESyXM_BzFJzcIe3GD5S0tbjJDj6EBVn-SPsPKH"',
      );
      expect(data.totalSupplyLP).toMatchInlineSnapshot("4986244178n");
      expect(data.reserve0).toMatchInlineSnapshot("4408450497n");
      expect(data.reserve1).toMatchInlineSnapshot("5646981229n");
      expect(data.token0WalletAddress).toMatchInlineSnapshot(
        '"EQApEyTSlHzor-pzEvjtrFPrMfRmlnBJSvAcEHqz7M3PF3Tb"',
      );
      expect(data.token1WalletAddress).toMatchInlineSnapshot(
        '"EQCczTPaZawFh8ueeTII6mTkOEQQoyi9adhyJwOtiDmFuB9j"',
      );
      expect(data.lpFee).toMatchInlineSnapshot("20n");
      expect(data.protocolFee).toMatchInlineSnapshot("10n");
      expect(data.protocolFeeAddress).toMatchInlineSnapshot("null");
      expect(data.collectedToken0ProtocolFee).toMatchInlineSnapshot("2519317n");
      expect(data.collectedToken1ProtocolFee).toMatchInlineSnapshot("514527n");
    });
  });
});
