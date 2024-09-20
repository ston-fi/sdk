import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { Address, beginCell, type Sender } from "@ton/ton";

import {
  createMockProvider,
  createMockObj,
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "@/test-utils";

import { PtonV1 } from "@/contracts/pTON/v1/PtonV1";

import { DEX_VERSION } from "../../constants";

import { BaseRouterV2_1 } from "./BaseRouterV2_1";
import { BasePoolV2_1 } from "../pool/BasePoolV2_1";
import { VaultV2_1 } from "../vault/VaultV2_1";

const USER_WALLET_ADDRESS = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";
const ROUTER_ADDRESS = "kQCas2p939ESyXM_BzFJzcIe3GD5S0tbjJDj6EBVn-SPsEkN";
const OFFER_JETTON_ADDRESS = "kQDLvsZol3juZyOAVG8tWsJntOxeEZWEaWCbbSjYakQpuYN5"; // TestRED
const ASK_JETTON_ADDRESS = "kQB_TOJSB7q3-Jm1O8s0jKFtqLElZDPjATs5uJGsujcjznq3"; // TestBLUE

const PTON_CONTRACT = PtonV1.create(
  "kQAcOvXSnnOhCdLYc6up2ECYwtNNTzlmOlidBeCs5cFPV7AM",
);

describe("BaseRouterV2_1", () => {
  beforeAll(setup);

  beforeEach(() => {
    vi.useFakeTimers({
      now: 0,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("version", () => {
    it("should have expected static value", () => {
      expect(BaseRouterV2_1.version).toBe(DEX_VERSION.v2_1);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(
        BaseRouterV2_1.gasConstants.provideLpJetton.forwardGasAmount,
      ).toMatchInlineSnapshot("235000000n");
      expect(
        BaseRouterV2_1.gasConstants.provideLpJetton.gasAmount,
      ).toMatchInlineSnapshot("300000000n");
      expect(
        BaseRouterV2_1.gasConstants.provideLpTon.forwardGasAmount,
      ).toMatchInlineSnapshot("300000000n");
      expect(
        BaseRouterV2_1.gasConstants.swapJettonToJetton.forwardGasAmount,
      ).toMatchInlineSnapshot("240000000n");
      expect(
        BaseRouterV2_1.gasConstants.swapJettonToJetton.gasAmount,
      ).toMatchInlineSnapshot("300000000n");
      expect(
        BaseRouterV2_1.gasConstants.swapJettonToTon.forwardGasAmount,
      ).toMatchInlineSnapshot("240000000n");
      expect(
        BaseRouterV2_1.gasConstants.swapJettonToTon.gasAmount,
      ).toMatchInlineSnapshot("300000000n");
      expect(
        BaseRouterV2_1.gasConstants.swapTonToJetton.forwardGasAmount,
      ).toMatchInlineSnapshot("300000000n");
    });
  });

  describe("constructor", () => {
    it("should create an instance of BaseRouterV2_1", () => {
      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      expect(contract).toBeInstanceOf(BaseRouterV2_1);
    });

    it("should create an instance of BaseRouterV2_1 with given address", () => {
      const address = USER_WALLET_ADDRESS; // just an address, not a real Router v2 contract

      const contract = BaseRouterV2_1.create(address);

      expect(contract.address?.toString({ bounceable: false })).toEqual(
        USER_WALLET_ADDRESS,
      );
    });

    it("should create an instance of BaseRouterV2_1 with default gasConstants", () => {
      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      expect(contract.gasConstants).toEqual(BaseRouterV2_1.gasConstants);
    });

    it("should create an instance of BaseRouterV2_1 with given gasConstants", () => {
      const gasConstants: Partial<BaseRouterV2_1["gasConstants"]> = {
        swapJettonToJetton: {
          gasAmount: BigInt("1"),
          forwardGasAmount: BigInt("2"),
        },
      };

      const contract = new BaseRouterV2_1(ROUTER_ADDRESS, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createSwapBody", () => {
    const txArguments = {
      receiverAddress: USER_WALLET_ADDRESS,
      refundAddress: USER_WALLET_ADDRESS,
      minAskAmount: "900000000",
      askJettonWalletAddress: ASK_JETTON_ADDRESS,
    };

    it("should build expected tx body", async () => {
      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      const body = await contract.createSwapBody({
        ...txArguments,
      });

      expect(body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAoAAB4WZk3iqAD+mcSkD3Vv8TNqd5ZpGULbUWJKyGfGAnZzcSNZdG5HnQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmiAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAAAAAAAAcJAAQBTQ1pOkAgAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAUQsBQ24Q=="',
      );
    });

    it("should build expected tx body when referralAddress is defined", async () => {
      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      const body = await contract.createSwapBody({
        ...txArguments,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAwQAB4WZk3iqAD+mcSkD3Vv8TNqd5ZpGULbUWJKyGfGAnZzcSNZdG5HnQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmiAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAAAAAAAAcJAAQCVQ1pOkAgAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAVAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIZMcmAw=="',
      );
    });

    it("should throw error if referralValue not in range", async () => {
      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      await expect(() => {
        return contract.createSwapBody({
          ...txArguments,
          referralValue: 200,
        });
      }).rejects.toThrowError();

      await expect(() => {
        return contract.createSwapBody({
          ...txArguments,
          referralValue: -1,
        });
      }).rejects.toThrowError();
    });

    it("should build expected tx body when deadline is defined", async () => {
      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      const body = await contract.createSwapBody({
        ...txArguments,
        deadline: 1000,
      });

      expect(body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAoAAB4WZk3iqAD+mcSkD3Vv8TNqd5ZpGULbUWJKyGfGAnZzcSNZdG5HnQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmiAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAAAAAAAAfRAAQBTQ1pOkAgAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAUQdPVUag=="',
      );
    });
  });

  describe("createCrossSwapBody", () => {
    const txArguments = {
      receiverAddress: USER_WALLET_ADDRESS,
      refundAddress: USER_WALLET_ADDRESS,
      minAskAmount: "900000000",
      askJettonWalletAddress: ASK_JETTON_ADDRESS,
    };

    it("should build expected tx body", async () => {
      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      const body = await contract.createCrossSwapBody({
        ...txArguments,
      });

      expect(body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAoAAB4WnPGluAD+mcSkD3Vv8TNqd5ZpGULbUWJKyGfGAnZzcSNZdG5HnQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmiAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAAAAAAAAcJAAQBTQ1pOkAgAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAUQBHeB8A=="',
      );
    });

    it("should build expected tx body when referralAddress is defined", async () => {
      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      const body = await contract.createSwapBody({
        ...txArguments,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAwQAB4WZk3iqAD+mcSkD3Vv8TNqd5ZpGULbUWJKyGfGAnZzcSNZdG5HnQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmiAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAAAAAAAAcJAAQCVQ1pOkAgAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAVAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIZMcmAw=="',
      );
    });

    it("should throw error if referralValue not in range", async () => {
      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      await expect(() => {
        return contract.createCrossSwapBody({
          ...txArguments,
          referralValue: 200,
        });
      }).rejects.toThrowError();

      await expect(() => {
        return contract.createCrossSwapBody({
          ...txArguments,
          referralValue: -1,
        });
      }).rejects.toThrowError();
    });

    it("should build expected tx body when deadline is defined", async () => {
      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      const body = await contract.createCrossSwapBody({
        ...txArguments,
        deadline: 1000,
      });

      expect(body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAoAAB4WnPGluAD+mcSkD3Vv8TNqd5ZpGULbUWJKyGfGAnZzcSNZdG5HnQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmiAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAAAAAAAAfRAAQBTQ1pOkAgAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAUQwJbjew=="',
      );
    });
  });

  describe("getSwapJettonToJettonTxParams", () => {
    const txArguments = {
      userWalletAddress: USER_WALLET_ADDRESS,
      offerJettonAddress: OFFER_JETTON_ADDRESS,
      askJettonAddress: ASK_JETTON_ADDRESS,
      offerAmount: "500000000",
      minAskAmount: "200000000",
    };

    const provider = createMockProviderFromSnapshot((address, method) => {
      if (
        address === Address.normalize(txArguments.offerJettonAddress) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOACD+9EGh6wT/2pEbZWrfCmVbsdpQVGU9308qh2gel9QwQM97q5A==",
        );
      }

      if (
        address === Address.normalize(txArguments.askJettonAddress) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToJettonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA+wABsA+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAeFmZN4qgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEKNZKeA="',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when referralAddress is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToJettonTxParams({
        ...txArguments,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckECAwEAARwAAbAPin6lAAAAAAAAAABB3NZQCAE1ZtT7v6IlkuZ+DmKTm4Q9uMHylpa3GSHH0ICrP8kfYQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmggcnDgBAQHhZmTeKoABAM5g2SPF69zQu52aPmhZDOzP9L2+f39v9XQMt2w5RbAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkACAJVAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABUABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ojn+1Zo"',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToJettonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA+wABsA+KfqUAAAAAAAAwOUHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAeFmZN4qgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFELHA3qM="',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToJettonTxParams({
        ...txArguments,
        gasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA+wABsA+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAeFmZN4qgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEKNZKeA="',
      );
      expect(params.value).toMatchInlineSnapshot("1n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToJettonTxParams({
        ...txArguments,
        forwardGasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA+AABqg+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaAgMBAeFmZN4qgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEAkqTV4="',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when custom jettonCustomPayload is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToJettonTxParams({
        ...txArguments,
        jettonCustomPayload: beginCell().storeBit(1).endCell(),
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBBAEA/wACsA+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKBycOAEBAgABwAHhZmTeKoABAM5g2SPF69zQu52aPmhZDOzP9L2+f39v9XQMt2w5RbAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkADAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRCeEC8j"',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });
  });

  describe("sendSwapJettonToJetton", () => {
    it("should call getSwapJettonToJettonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<
        BaseRouterV2_1["sendSwapJettonToJetton"]
      >[2];

      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      const getSwapJettonToJettonTxParams = vi.spyOn(
        contract,
        "getSwapJettonToJettonTxParams",
      );

      const txParams = {} as Awaited<
        ReturnType<typeof contract.getSwapJettonToJettonTxParams>
      >;

      getSwapJettonToJettonTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendSwapJettonToJetton(provider, sender, txArgs);

      expect(getSwapJettonToJettonTxParams).toHaveBeenCalledWith(
        provider,
        txArgs,
      );
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("getSwapJettonToTonTxParams", () => {
    const txArguments = {
      userWalletAddress: USER_WALLET_ADDRESS,
      offerJettonAddress: OFFER_JETTON_ADDRESS,
      proxyTon: PTON_CONTRACT,
      offerAmount: "500000000",
      minAskAmount: "200000000",
    };

    const provider = createMockProviderFromSnapshot((address, method) => {
      if (
        address === Address.normalize(txArguments.offerJettonAddress) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOACD+9EGh6wT/2pEbZWrfCmVbsdpQVGU9308qh2gel9QwQM97q5A==",
        );
      }

      if (
        address ===
          Address.normalize(txArguments.proxyTon.address.toString()) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPwJB4oTQ==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToTonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA+wABsA+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAeFmZN4qgAIqFqMWTE1aoxM/MRD/EEluAMqKyKvv/FAn4CTTNIDD8ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEOCS/Uw="',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when referralAddress is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToTonTxParams({
        ...txArguments,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckECAwEAARwAAbAPin6lAAAAAAAAAABB3NZQCAE1ZtT7v6IlkuZ+DmKTm4Q9uMHylpa3GSHH0ICrP8kfYQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmggcnDgBAQHhZmTeKoACKhajFkxNWqMTPzEQ/xBJbgDKisir7/xQJ+Ak0zSAw/AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkACAJVAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABUABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oixLx8D"',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToTonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA+wABsA+KfqUAAAAAAAAwOUHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAeFmZN4qgAIqFqMWTE1aoxM/MRD/EEluAMqKyKvv/FAn4CTTNIDD8ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEPILCg8="',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToTonTxParams({
        ...txArguments,
        gasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA+wABsA+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAeFmZN4qgAIqFqMWTE1aoxM/MRD/EEluAMqKyKvv/FAn4CTTNIDD8ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEOCS/Uw="',
      );
      expect(params.value).toMatchInlineSnapshot("1n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToTonTxParams({
        ...txArguments,
        forwardGasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA+AABqg+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaAgMBAeFmZN4qgAIqFqMWTE1aoxM/MRD/EEluAMqKyKvv/FAn4CTTNIDD8ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEErhmfI="',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when custom jettonCustomPayload is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToTonTxParams({
        ...txArguments,
        jettonCustomPayload: beginCell().storeBit(1).endCell(),
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBBAEA/wACsA+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKBycOAEBAgABwAHhZmTeKoACKhajFkxNWqMTPzEQ/xBJbgDKisir7/xQJ+Ak0zSAw/AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkADAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRDd2/uP"',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });
  });

  describe("sendSwapJettonToTon", () => {
    it("should call getSwapJettonToTonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<BaseRouterV2_1["sendSwapJettonToTon"]>[2];

      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      const getSwapJettonToTonTxParams = vi.spyOn(
        contract,
        "getSwapJettonToTonTxParams",
      );

      const txParams = {} as Awaited<
        ReturnType<typeof contract.getSwapJettonToTonTxParams>
      >;

      getSwapJettonToTonTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendSwapJettonToTon(provider, sender, txArgs);

      expect(getSwapJettonToTonTxParams).toHaveBeenCalledWith(provider, txArgs);
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("getSwapTonToJettonTxParams", () => {
    const txArguments = {
      userWalletAddress: USER_WALLET_ADDRESS,
      proxyTon: PTON_CONTRACT,
      askJettonAddress: ASK_JETTON_ADDRESS,
      offerAmount: "500000000",
      minAskAmount: "200000000",
    };
    const provider = createMockProviderFromSnapshot((address, method) => {
      if (
        address === Address.normalize(txArguments.askJettonAddress) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
        );
      }

      if (
        address ===
          Address.normalize(txArguments.proxyTon.address.toString()) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPwJB4oTQ==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapTonToJettonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA2gABbQ+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9gEEeGjAMBAeFmZN4qgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEGX3TdA="',
      );
      expect(params.value).toMatchInlineSnapshot("800000000n");
    });

    it("should build expected tx params when referralAddress is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapTonToJettonTxParams({
        ...txArguments,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA+wABbQ+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9gEEeGjAMBAeFmZN4qgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAlUC+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmiEfbTVg="',
      );
      expect(params.value).toMatchInlineSnapshot("800000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapTonToJettonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA2gABbQ+KfqUAAAAAAAAwOUHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9gEEeGjAMBAeFmZN4qgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEAiZHss="',
      );
      expect(params.value).toMatchInlineSnapshot("800000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapTonToJettonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA2gABbQ+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9gEEeGjAMBAeFmZN4qgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEGX3TdA="',
      );
      expect(params.value).toMatchInlineSnapshot("800000000n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapTonToJettonTxParams({
        ...txArguments,
        forwardGasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA1wABZw+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9gBAcBAeFmZN4qgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEHNq53w="',
      );
      expect(params.value).toMatchInlineSnapshot("500000001n");
    });
  });

  describe("sendSwapTonToJetton", () => {
    it("should call getSwapTonToJettonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<BaseRouterV2_1["sendSwapTonToJetton"]>[2];

      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      const getSwapTonToJettonTxParams = vi.spyOn(
        contract,
        "getSwapTonToJettonTxParams",
      );

      const txParams = {} as Awaited<
        ReturnType<typeof contract.getSwapTonToJettonTxParams>
      >;

      getSwapTonToJettonTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendSwapTonToJetton(provider, sender, txArgs);

      expect(getSwapTonToJettonTxParams).toHaveBeenCalledWith(provider, txArgs);
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("createProvideLiquidityBody", () => {
    const txArguments = {
      routerWalletAddress: "EQAIBnMGyR4vXuaF3OzR80LIZ2Z_pe3z-_t_q6Blu2HKLeaY",
      receiverAddress: USER_WALLET_ADDRESS,
      refundAddress: USER_WALLET_ADDRESS,
      bothPositive: true,
      minLpOut: "900000000",
    };

    it("should build expected tx body", async () => {
      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      const body = await contract.createProvideLiquidityBody({
        ...txArguments,
      });

      expect(body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAnQAB4TfAlt+AAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWwAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmiAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAAAAAAAAcJAAQBNQ1pOkAgAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEEFrlX4Q=="',
      );
    });
  });

  describe("getProvideLiquidityJettonTxParams", () => {
    const txArguments = {
      userWalletAddress: USER_WALLET_ADDRESS,
      sendTokenAddress: OFFER_JETTON_ADDRESS,
      otherTokenAddress: ASK_JETTON_ADDRESS,
      sendAmount: "500000000",
      minLpOut: "1",
    };

    const provider = createMockProviderFromSnapshot((address, method) => {
      if (
        address === Address.normalize(txArguments.sendTokenAddress) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOACD+9EGh6wT/2pEbZWrfCmVbsdpQVGU9308qh2gel9QwQM97q5A==",
        );
      }

      if (
        address === Address.normalize(txArguments.otherTokenAddress) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getProvideLiquidityJettonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA9QABsA+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBwDoYEBAeE3wJbfgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRBNLqJ9k="',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getProvideLiquidityJettonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA9QABsA+KfqUAAAAAAAAwOUHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBwDoYEBAeE3wJbfgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRBIvBXP4="',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getProvideLiquidityJettonTxParams({
        ...txArguments,
        gasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA9QABsA+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBwDoYEBAeE3wJbfgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRBNLqJ9k="',
      );
      expect(params.value).toMatchInlineSnapshot("1n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getProvideLiquidityJettonTxParams({
        ...txArguments,
        forwardGasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA8gABqg+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaAgMBAeE3wJbfgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRBAOUnrs="',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when custom jettonCustomPayload is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getProvideLiquidityJettonTxParams({
        ...txArguments,
        jettonCustomPayload: beginCell().storeBit(1).endCell(),
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBBAEA+QACsA+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKBwDoYEBAgABwAHhN8CW34ABAM5g2SPF69zQu52aPmhZDOzP9L2+f39v9XQMt2w5RbAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkADAEcQGAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QSlKDRx"',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });
  });

  describe("sendProvideLiquidityJetton", () => {
    it("should call getProvideLiquidityJettonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<
        BaseRouterV2_1["sendProvideLiquidityJetton"]
      >[2];

      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      const getProvideLiquidityJettonTxParams = vi.spyOn(
        contract,
        "getProvideLiquidityJettonTxParams",
      );

      const txParams = {} as Awaited<
        ReturnType<typeof contract.getProvideLiquidityJettonTxParams>
      >;

      getProvideLiquidityJettonTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendProvideLiquidityJetton(provider, sender, txArgs);

      expect(getProvideLiquidityJettonTxParams).toHaveBeenCalledWith(
        provider,
        txArgs,
      );
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("getProvideLiquidityTonTxParams", () => {
    const txArguments = {
      userWalletAddress: USER_WALLET_ADDRESS,
      otherTokenAddress: OFFER_JETTON_ADDRESS,
      proxyTon: PTON_CONTRACT,
      sendAmount: "500000000",
      minLpOut: "1",
    };

    const provider = createMockProviderFromSnapshot((address, method) => {
      if (
        address === Address.normalize(txArguments.otherTokenAddress) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
        );
      }

      if (
        address ===
          Address.normalize(txArguments.proxyTon.address.toString()) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPwJB4oTQ==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getProvideLiquidityTonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA1AABbQ+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9gEEeGjAMBAeE3wJbfgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRBPMjwBs="',
      );
      expect(params.value).toMatchInlineSnapshot("800000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getProvideLiquidityTonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA1AABbQ+KfqUAAAAAAAAwOUHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9gEEeGjAMBAeE3wJbfgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRBFwWFpE="',
      );
      expect(params.value).toMatchInlineSnapshot("800000000n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getProvideLiquidityTonTxParams({
        ...txArguments,
        forwardGasAmount: "2",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA0QABZw+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9gBAsBAeE3wJbfgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRBAS9aEc="',
      );
      expect(params.value).toMatchInlineSnapshot("500000002n");
    });
  });

  describe("sendProvideLiquidityTon", () => {
    it("should call getProvideLiquidityTonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<
        BaseRouterV2_1["sendProvideLiquidityTon"]
      >[2];

      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      const getProvideLiquidityTonTxParams = vi.spyOn(
        contract,
        "getProvideLiquidityTonTxParams",
      );

      const txParams = {} as Awaited<
        ReturnType<typeof contract.getProvideLiquidityTonTxParams>
      >;

      getProvideLiquidityTonTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendProvideLiquidityTon(provider, sender, txArgs);

      expect(getProvideLiquidityTonTxParams).toHaveBeenCalledWith(
        provider,
        txArgs,
      );
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("getSingleSideProvideLiquidityJettonTxParams", () => {
    const txArguments = {
      userWalletAddress: USER_WALLET_ADDRESS,
      sendTokenAddress: OFFER_JETTON_ADDRESS,
      otherTokenAddress: ASK_JETTON_ADDRESS,
      sendAmount: "500000000",
      minLpOut: "1",
    };

    const provider = createMockProviderFromSnapshot((address, method) => {
      if (
        address === Address.normalize(txArguments.sendTokenAddress) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOACD+9EGh6wT/2pEbZWrfCmVbsdpQVGU9308qh2gel9QwQM97q5A==",
        );
      }

      if (
        address === Address.normalize(txArguments.otherTokenAddress) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSingleSideProvideLiquidityJettonTxParams(
        {
          ...txArguments,
        },
      );

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA9QABsA+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCF9eEAEBAeE3wJbfgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQBDg9pog="',
      );
      expect(params.value).toMatchInlineSnapshot("1000000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSingleSideProvideLiquidityJettonTxParams(
        {
          ...txArguments,
          queryId: 12345,
        },
      );

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA9QABsA+KfqUAAAAAAAAwOUHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCF9eEAEBAeE3wJbfgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQBGEW3a8="',
      );
      expect(params.value).toMatchInlineSnapshot("1000000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSingleSideProvideLiquidityJettonTxParams(
        {
          ...txArguments,
          gasAmount: "1",
        },
      );

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA9QABsA+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCF9eEAEBAeE3wJbfgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQBDg9pog="',
      );
      expect(params.value).toMatchInlineSnapshot("1n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSingleSideProvideLiquidityJettonTxParams(
        {
          ...txArguments,
          forwardGasAmount: "1",
        },
      );

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA8gABqg+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaAgMBAeE3wJbfgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQBHQMPKg="',
      );
      expect(params.value).toMatchInlineSnapshot("1000000000n");
    });

    it("should build expected tx params when custom jettonCustomPayload is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSingleSideProvideLiquidityJettonTxParams(
        {
          ...txArguments,
          jettonCustomPayload: beginCell().storeBit(1).endCell(),
        },
      );

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBBAEA+QACsA+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9hAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKF9eEAEBAgABwAHhN8CW34ABAM5g2SPF69zQu52aPmhZDOzP9L2+f39v9XQMt2w5RbAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkADAEcQGAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0ATYzJnp"',
      );
      expect(params.value).toMatchInlineSnapshot("1000000000n");
    });
  });

  describe("sendSingleSideProvideLiquidityJetton", () => {
    it("should call getSingleSideProvideLiquidityJettonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<
        BaseRouterV2_1["sendSingleSideProvideLiquidityJetton"]
      >[2];

      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      const getSingleSideProvideLiquidityJettonTxParams = vi.spyOn(
        contract,
        "getSingleSideProvideLiquidityJettonTxParams",
      );

      const txParams = {} as Awaited<
        ReturnType<typeof contract.getSingleSideProvideLiquidityJettonTxParams>
      >;

      getSingleSideProvideLiquidityJettonTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendSingleSideProvideLiquidityJetton(
        provider,
        sender,
        txArgs,
      );

      expect(getSingleSideProvideLiquidityJettonTxParams).toHaveBeenCalledWith(
        provider,
        txArgs,
      );
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("getSingleSideProvideLiquidityTonTxParams", () => {
    const txArguments = {
      userWalletAddress: USER_WALLET_ADDRESS,
      otherTokenAddress: OFFER_JETTON_ADDRESS,
      proxyTon: PTON_CONTRACT,
      sendAmount: "500000000",
      minLpOut: "1",
    };

    const provider = createMockProviderFromSnapshot((address, method) => {
      if (
        address === Address.normalize(txArguments.otherTokenAddress) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
        );
      }

      if (
        address ===
          Address.normalize(txArguments.proxyTon.address.toString()) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPwJB4oTQ==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSingleSideProvideLiquidityTonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA1AABbQ+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9gEL68IAMBAeE3wJbfgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQBNp5G1A="',
      );
      expect(params.value).toMatchInlineSnapshot("1300000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSingleSideProvideLiquidityTonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA1AABbQ+KfqUAAAAAAAAwOUHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9gEL68IAMBAeE3wJbfgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQBHVMzdo="',
      );
      expect(params.value).toMatchInlineSnapshot("1300000000n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSingleSideProvideLiquidityTonTxParams({
        ...txArguments,
        forwardGasAmount: "2",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA0QABZw+KfqUAAAAAAAAAAEHc1lAIATVm1Pu/oiWS5n4OYpObhD24wfKWlrcZIcfQgKs/yR9gBAsBAeE3wJbfgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQBHMlylQ="',
      );
      expect(params.value).toMatchInlineSnapshot("500000002n");
    });
  });

  describe("sendSingleSideProvideLiquidityTon", () => {
    it("should call getSingleSideProvideLiquidityTonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<
        BaseRouterV2_1["sendSingleSideProvideLiquidityTon"]
      >[2];

      const contract = BaseRouterV2_1.create(ROUTER_ADDRESS);

      const getSingleSideProvideLiquidityTonTxParams = vi.spyOn(
        contract,
        "getSingleSideProvideLiquidityTonTxParams",
      );

      const txParams = {} as Awaited<
        ReturnType<typeof contract.getSingleSideProvideLiquidityTonTxParams>
      >;

      getSingleSideProvideLiquidityTonTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendSingleSideProvideLiquidityTon(
        provider,
        sender,
        txArgs,
      );

      expect(getSingleSideProvideLiquidityTonTxParams).toHaveBeenCalledWith(
        provider,
        txArgs,
      );
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("getPoolAddress", () => {
    const snapshot = createProviderSnapshot().cell(
      "te6cckEBAQEAJAAAQ4AcWjZMMl4PnV4hXc0bTXOnmOCQPE08nma5bszegFth3FBjJd6+",
    );
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const poolAddress = await contract.getPoolAddress({
        token0: "EQBqMJD7AXc2Wtt9NHg4kzMbJi2JwS_Hk6kCtLsw2c2CPyVU", // Wallet of ASK_JETTON_ADDRESS with USER_WALLET_ADDRESS owner
        token1: "EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X", // Wallet of OFFER_JETTON_ADDRESS with USER_WALLET_ADDRESS owner
      });

      expect(poolAddress).toMatchInlineSnapshot(
        '"EQDi0bJhkvB86vEK7mjaa508xwSB4mnk8zXLdmb0AtsO4iG7"',
      );
    });
  });

  describe("getPool", () => {
    it("should return Pool instance for existing pair", async () => {
      const provider = createMockProviderFromSnapshot((address, method) => {
        if (
          address === Address.normalize(ROUTER_ADDRESS) &&
          method === "get_pool_address"
        ) {
          return createProviderSnapshot().cell(
            "te6cckEBAQEAJAAAQ4AcWjZMMl4PnV4hXc0bTXOnmOCQPE08nma5bszegFth3FBjJd6+",
          );
        }

        if (
          address === Address.normalize(OFFER_JETTON_ADDRESS) &&
          method === "get_wallet_address"
        ) {
          return createProviderSnapshot().cell(
            "te6cckEBAQEAJAAAQ4ATmaZ7TLWAsPlzzyZBHUychwiCFGUXrTsOROB1sQcwtxDOko/O",
          );
        }

        if (
          address === Address.normalize(ASK_JETTON_ADDRESS) &&
          method === "get_wallet_address"
        ) {
          return createProviderSnapshot().cell(
            "te6cckEBAQEAJAAAQ4AFImSaUo+dFf1OYl8dtYp9Zj6M0s4JKV4Dgg9WfZm54vCRWjIN",
          );
        }

        throw new Error(`Unexpected call: ${address} ${method}`);
      });

      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const pool = await contract.getPool({
        token0: OFFER_JETTON_ADDRESS,
        token1: ASK_JETTON_ADDRESS,
      });

      expect(pool).toBeInstanceOf(BasePoolV2_1);
    });
  });

  describe("getVaultAddress", () => {
    const snapshot = createProviderSnapshot().cell(
      "te6cckEBAQEAJAAAQ4AZABzFeODYBGs2+ChMt5KqNDN2J36bMzV5qsfyYIb2hdBmJxuo",
    );
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const vaultAddress = await contract.getVaultAddress({
        user: USER_WALLET_ADDRESS,
        tokenWallet: OFFER_JETTON_ADDRESS,
      });

      expect(vaultAddress).toMatchInlineSnapshot(
        '"EQDIAOYrxwbAI1m3wUJlvJVRoZuxO_TZmavNVj-TBDe0LiLR"',
      );
    });
  });

  describe("getVault", () => {
    it("should return Vault instance for user and tokenMinter", async () => {
      const snapshot = createProviderSnapshot().cell(
        "te6cckEBAQEAJAAAQ4ATmaZ7TLWAsPlzzyZBHUychwiCFGUXrTsOROB1sQcwtxDOko/O",
      );
      const provider = createMockProviderFromSnapshot(snapshot);

      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const pool = await contract.getVault({
        user: USER_WALLET_ADDRESS,
        tokenMinter: OFFER_JETTON_ADDRESS,
      });

      expect(pool).toBeInstanceOf(VaultV2_1);
    });
  });

  describe("getRouterVersion", () => {
    const snapshot = createProviderSnapshot()
      .number("2")
      .number("0")
      .cell("te6cckEBAQEACQAADnJlbGVhc2VkOXx8");
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const data = await contract.getRouterVersion();

      expect(data.major).toStrictEqual(2);
      expect(data.minor).toStrictEqual(0);
      expect(data.development).toStrictEqual("release");
    });
  });

  describe("getRouterData", () => {
    const snapshot = createProviderSnapshot()
      .number("100")
      .cell("te6cckEBAQEAEgAAIGNvbnN0YW50X3Byb2R1Y3Svg+BE")
      .number("0")
      .cell(
        "te6cckEBAQEAJAAAQ4AVNOalswyRkG4pCMopecKdFTbQWmMc0eZ0+lHY/BngFzCuo2Mw",
      )
      .cell("te6cckEBAgEAFgABIQAAAAAAAAAAAAAAAAAAAAAgAQAAnpyZMQ==")
      .cell(
        "te6cckEBAgEALQABDv8AiNDtHtgBCEIChnQ3+jCz9g/PrBDgdaR6qm2P9KGSGpEez2qAlMZp3knh+w3/",
      )
      .cell(
        "te6cckEBAgEALQABDv8AiNDtHtgBCEIC5iL45BzAt4svg+TAdXsfYKBJ25AwN23oNwIKAZBBjrFI2HBV",
      )
      .cell(
        "te6cckEBAgEALQABDv8AiNDtHtgBCEIC5wowbAAnJ5YkP1ac4Mko6kz8nxtlxbAGbjghWfXoDfVdmtEr",
      )
      .cell(
        "te6cckEBAgEALQABDv8AiNDtHtgBCEIC9yl8isz61M/WMpoDa/zAHcbJqrSfLJXC0j7Bcq1o/t4aA6m8",
      );
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const data = await contract.getRouterData();

      expect(data.routerId).toMatchInlineSnapshot("100");
      expect(data.dexType).toMatchInlineSnapshot('"constant_product"');
      expect(data.isLocked).toBe(false);
      expect(data.adminAddress).toMatchInlineSnapshot(
        '"EQCppzUtmGSMg3FIRlFLzhToqbaC0xjmjzOn0o7H4M8Aua1t"',
      );
      expect(data.tempUpgrade.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAFgABIQAAAAAAAAAAAAAAAAAAAAAgAQAAnpyZMQ=="',
      );
      expect(data.poolCode.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEALQABDv8AiNDtHtgBCEIChnQ3+jCz9g/PrBDgdaR6qm2P9KGSGpEez2qAlMZp3knh+w3/"',
      );
      expect(
        data.jettonLpWalletCode.toBoc().toString("base64"),
      ).toMatchInlineSnapshot(
        '"te6cckEBAgEALQABDv8AiNDtHtgBCEIC5iL45BzAt4svg+TAdXsfYKBJ25AwN23oNwIKAZBBjrFI2HBV"',
      );
      expect(
        data.lpAccountCode.toBoc().toString("base64"),
      ).toMatchInlineSnapshot(
        '"te6cckEBAgEALQABDv8AiNDtHtgBCEIC5wowbAAnJ5YkP1ac4Mko6kz8nxtlxbAGbjghWfXoDfVdmtEr"',
      );
      expect(data.vaultCode.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEALQABDv8AiNDtHtgBCEIC9yl8isz61M/WMpoDa/zAHcbJqrSfLJXC0j7Bcq1o/t4aA6m8"',
      );
    });
  });
});
