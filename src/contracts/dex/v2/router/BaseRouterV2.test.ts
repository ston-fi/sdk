import { beforeAll, describe, expect, it, vi } from "vitest";
import type { Sender } from "@ton/ton";

import {
  createMockProvider,
  createMockObj,
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "@/test-utils";

import { PtonV1 } from "@/contracts/pTON/v1/PtonV1";

import { DEX_VERSION } from "../../constants";

import { BaseRouterV2 } from "./BaseRouterV2";

const USER_WALLET_ADDRESS = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";
const ROUTER_ADDRESS = "UQAJNLguA4fx_WjSMq1ALW-5QgNllYMT7ss4A-T-kAV5SRvo";
const OFFER_JETTON_ADDRESS = "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO"; // STON
const ASK_JETTON_ADDRESS = "EQBX6K9aXVl3nXINCyPPL86C4ONVmQ8vK360u6dykFKXpHCa"; // GEMSTON

const PTON_CONTRACT = PtonV1.create(
  "EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez",
);

describe("BaseRouterV2", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(BaseRouterV2.version).toBe(DEX_VERSION.v2);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(
        BaseRouterV2.gasConstants.provideLpJetton.forwardGasAmount,
      ).toMatchInlineSnapshot("235000000n");
      expect(
        BaseRouterV2.gasConstants.provideLpJetton.gasAmount,
      ).toMatchInlineSnapshot("300000000n");
      expect(
        BaseRouterV2.gasConstants.provideLpTon.forwardGasAmount,
      ).toMatchInlineSnapshot("300000000n");
      expect(
        BaseRouterV2.gasConstants.swapJettonToJetton.forwardGasAmount,
      ).toMatchInlineSnapshot("240000000n");
      expect(
        BaseRouterV2.gasConstants.swapJettonToJetton.gasAmount,
      ).toMatchInlineSnapshot("300000000n");
      expect(
        BaseRouterV2.gasConstants.swapJettonToTon.forwardGasAmount,
      ).toMatchInlineSnapshot("240000000n");
      expect(
        BaseRouterV2.gasConstants.swapJettonToTon.gasAmount,
      ).toMatchInlineSnapshot("300000000n");
      expect(
        BaseRouterV2.gasConstants.swapTonToJetton.forwardGasAmount,
      ).toMatchInlineSnapshot("300000000n");
    });
  });

  describe("constructor", () => {
    it("should create an instance of BaseRouterV2", () => {
      const contract = BaseRouterV2.create(ROUTER_ADDRESS);

      expect(contract).toBeInstanceOf(BaseRouterV2);
    });

    it("should create an instance of BaseRouterV2 with given address", () => {
      const address = USER_WALLET_ADDRESS; // just an address, not a real Router v2 contract

      const contract = BaseRouterV2.create(address);

      expect(contract.address?.toString({ bounceable: false })).toEqual(
        USER_WALLET_ADDRESS,
      );
    });

    it("should create an instance of BaseRouterV2 with default gasConstants", () => {
      const contract = BaseRouterV2.create(ROUTER_ADDRESS);

      expect(contract.gasConstants).toEqual(BaseRouterV2.gasConstants);
    });

    it("should create an instance of BaseRouterV2 with given gasConstants", () => {
      const gasConstants: Partial<BaseRouterV2["gasConstants"]> = {
        swapJettonToJetton: {
          gasAmount: BigInt("1"),
          forwardGasAmount: BigInt("2"),
        },
      };

      const contract = new BaseRouterV2(ROUTER_ADDRESS, {
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
      const contract = BaseRouterV2.create(ROUTER_ADDRESS);

      const body = await contract.createSwapBody({
        ...txArguments,
      });

      expect(body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAmAAB0SWThWGACv0V60urLvOuQaFkeeX50FwcarMh5eVv1pd07lIKUvSQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmiAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QAEAU0NaTpAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEFyUKpo="',
      );
    });

    it("should build expected tx body when referralAddress is defined", async () => {
      const contract = BaseRouterV2.create(ROUTER_ADDRESS);

      const body = await contract.createSwapBody({
        ...txArguments,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAuQAB0SWThWGACv0V60urLvOuQaFkeeX50FwcarMh5eVv1pd07lIKUvSQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmiAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QAEAlUNaTpAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmiO7rKw0="',
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
        address === txArguments.offerJettonAddress &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOACD+9EGh6wT/2pEbZWrfCmVbsdpQVGU9308qh2gel9QwQM97q5A==",
        );
      }

      if (
        address === txArguments.askJettonAddress &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToJettonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA8wABsA+KfqUAAAAAAAAAAEHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKTAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAdElk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRAnyLi6"',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when referralAddress is defined", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToJettonTxParams({
        ...txArguments,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckECAwEAARQAAbAPin6lAAAAAAAAAABB3NZQCAASaXBcBw/j+tGkZVqAWt9yhAbLKwYn3ZZwB8n9IArykwAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmggcnDgBAQHRJZOFYYABAM5g2SPF69zQu52aPmhZDOzP9L2+f39v9XQMt2w5RbAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAAgCVQL68IAgAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAVAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIKLSDpA=="',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToJettonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA8wABsA+KfqUAAAAAAAAwOUHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKTAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAdElk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRC7+Exx"',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToJettonTxParams({
        ...txArguments,
        gasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA8wABsA+KfqUAAAAAAAAAAEHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKTAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAdElk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRAnyLi6"',
      );
      expect(params.value).toMatchInlineSnapshot("1n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToJettonTxParams({
        ...txArguments,
        forwardGasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA8AABqg+KfqUAAAAAAAAAAEHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKTAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaAgMBAdElk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRCV4CpE"',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });
  });

  describe("sendSwapJettonToJetton", () => {
    it("should call getSwapJettonToJettonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<
        BaseRouterV2["sendSwapJettonToJetton"]
      >[2];

      const contract = BaseRouterV2.create(ROUTER_ADDRESS);

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
        address === txArguments.offerJettonAddress &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOACD+9EGh6wT/2pEbZWrfCmVbsdpQVGU9308qh2gel9QwQM97q5A==",
        );
      }

      if (
        address === txArguments.proxyTon.address.toString() &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPwJB4oTQ==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToTonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA8wABsA+KfqUAAAAAAAAAAEHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKTAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAdElk4VhgAIqFqMWTE1aoxM/MRD/EEluAMqKyKvv/FAn4CTTNIDD8ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRCdheIb"',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when referralAddress is defined", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToTonTxParams({
        ...txArguments,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckECAwEAARQAAbAPin6lAAAAAAAAAABB3NZQCAASaXBcBw/j+tGkZVqAWt9yhAbLKwYn3ZZwB8n9IArykwAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmggcnDgBAQHRJZOFYYACKhajFkxNWqMTPzEQ/xBJbgDKisir7/xQJ+Ak0zSAw/AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAAgCVQL68IAgAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAVAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIJ316QA=="',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToTonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA8wABsA+KfqUAAAAAAAAwOUHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKTAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAdElk4VhgAIqFqMWTE1aoxM/MRD/EEluAMqKyKvv/FAn4CTTNIDD8ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRABtRbQ"',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToTonTxParams({
        ...txArguments,
        gasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA8wABsA+KfqUAAAAAAAAAAEHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKTAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAdElk4VhgAIqFqMWTE1aoxM/MRD/EEluAMqKyKvv/FAn4CTTNIDD8ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRCdheIb"',
      );
      expect(params.value).toMatchInlineSnapshot("1n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToTonTxParams({
        ...txArguments,
        forwardGasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA8AABqg+KfqUAAAAAAAAAAEHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKTAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaAgMBAdElk4VhgAIqFqMWTE1aoxM/MRD/EEluAMqKyKvv/FAn4CTTNIDD8ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRAvrXDl"',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });
  });

  describe("sendSwapJettonToTon", () => {
    it("should call getSwapJettonToTonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<BaseRouterV2["sendSwapJettonToTon"]>[2];

      const contract = BaseRouterV2.create(ROUTER_ADDRESS);

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
        address === txArguments.askJettonAddress &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
        );
      }

      if (
        address === txArguments.proxyTon.address.toString() &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPwJB4oTQ==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getSwapTonToJettonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA0gABbQ+KfqUAAAAAAAAAAEHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKSEEeGjAMBAdElk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRAMEj5u"',
      );
      expect(params.value).toMatchInlineSnapshot("800000000n");
    });

    it("should build expected tx params when referralAddress is defined", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getSwapTonToJettonTxParams({
        ...txArguments,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA8wABbQ+KfqUAAAAAAAAAAEHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKSEEeGjAMBAdElk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAJVAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABUABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ohS1alt"',
      );
      expect(params.value).toMatchInlineSnapshot("800000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getSwapTonToJettonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA0gABbQ+KfqUAAAAAAAAwOUHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKSEEeGjAMBAdElk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRBT7bg1"',
      );
      expect(params.value).toMatchInlineSnapshot("800000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getSwapTonToJettonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA0gABbQ+KfqUAAAAAAAAAAEHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKSEEeGjAMBAdElk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRAMEj5u"',
      );
      expect(params.value).toMatchInlineSnapshot("800000000n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getSwapTonToJettonTxParams({
        ...txArguments,
        forwardGasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEAzwABZw+KfqUAAAAAAAAAAEHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKSBAcBAdElk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRDW9P2E"',
      );
      expect(params.value).toMatchInlineSnapshot("500000001n");
    });
  });

  describe("sendSwapTonToJetton", () => {
    it("should call getSwapTonToJettonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<BaseRouterV2["sendSwapTonToJetton"]>[2];

      const contract = BaseRouterV2.create(ROUTER_ADDRESS);

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
      const contract = BaseRouterV2.create(ROUTER_ADDRESS);

      const body = await contract.createProvideLiquidityBody({
        ...txArguments,
      });

      expect(body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAlQAB0fz55Y+AAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWwAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmiAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QAEATUNaTpAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRBOPMRyY="',
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
        address === txArguments.sendTokenAddress &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOACD+9EGh6wT/2pEbZWrfCmVbsdpQVGU9308qh2gel9QwQM97q5A==",
        );
      }

      if (
        address === txArguments.otherTokenAddress &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getProvideLiquidityJettonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA7QABsA+KfqUAAAAAAAAAAEHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKTAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBwDoYEBAdH8+eWPgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAEcQGAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QTlc08c"',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getProvideLiquidityJettonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA7QABsA+KfqUAAAAAAAAwOUHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKTAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBwDoYEBAdH8+eWPgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAEcQGAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QSwkk9r"',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getProvideLiquidityJettonTxParams({
        ...txArguments,
        gasAmount: "1",
        forwardGasAmount: "2",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA6gABqg+KfqUAAAAAAAAAAEHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKTAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaAgUBAdH8+eWPgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAEcQGAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QT1p9WZ"',
      );
      expect(params.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendProvideLiquidityJetton", () => {
    it("should call getProvideLiquidityJettonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<
        BaseRouterV2["sendProvideLiquidityJetton"]
      >[2];

      const contract = BaseRouterV2.create(ROUTER_ADDRESS);

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
        address === txArguments.otherTokenAddress &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
        );
      }

      if (
        address === txArguments.proxyTon.address.toString() &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPwJB4oTQ==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getProvideLiquidityTonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEAzAABbQ+KfqUAAAAAAAAAAEHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKSEEeGjAMBAdH8+eWPgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAEcQGAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QTUOytQ"',
      );
      expect(params.value).toMatchInlineSnapshot("800000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getProvideLiquidityTonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEAzAABbQ+KfqUAAAAAAAAwOUHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKSEEeGjAMBAdH8+eWPgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAEcQGAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QRygGnr"',
      );
      expect(params.value).toMatchInlineSnapshot("800000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2.create(ROUTER_ADDRESS));

      const params = await contract.getProvideLiquidityTonTxParams({
        ...txArguments,
        forwardGasAmount: "2",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEAyQABZw+KfqUAAAAAAAAAAEHc1lAIABJpcFwHD+P60aRlWoBa33KEBssrBifdlnAHyf0gCvKSBAsBAdH8+eWPgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEACAEcQGAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QSkr21y"',
      );
      expect(params.value).toMatchInlineSnapshot("500000002n");
    });
  });

  describe("sendProvideLiquidityTon", () => {
    it("should call getProvideLiquidityTonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<
        BaseRouterV2["sendProvideLiquidityTon"]
      >[2];

      const contract = BaseRouterV2.create(ROUTER_ADDRESS);

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

  describe("sendSingleSideProvideLiquidityJetton", () => {
    it("should call getSingleSideProvideLiquidityJettonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<
        BaseRouterV2["sendSingleSideProvideLiquidityJetton"]
      >[2];

      const contract = BaseRouterV2.create(ROUTER_ADDRESS);

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

  describe("sendSingleSideProvideLiquidityTon", () => {
    it("should call getSingleSideProvideLiquidityTonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<
        BaseRouterV2["sendSingleSideProvideLiquidityTon"]
      >[2];

      const contract = BaseRouterV2.create(ROUTER_ADDRESS);

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
});
