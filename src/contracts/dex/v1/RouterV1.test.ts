import { beforeAll, describe, expect, it, vi } from "vitest";
import { beginCell, type Sender } from "@ton/ton";

import { pTON } from "@/contracts/pTON";
import {
  createMockProvider,
  createMockObj,
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "@/test-utils";

import { DEX_VERSION } from "../constants";

import { PoolV1 } from "./PoolV1";
import { RouterV1 } from "./RouterV1";

const OFFER_JETTON_ADDRESS = "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO"; // STON
const ASK_JETTON_ADDRESS = "EQBX6K9aXVl3nXINCyPPL86C4ONVmQ8vK360u6dykFKXpHCa"; // GEMSTON
const USER_WALLET_ADDRESS = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";

const PTON_CONTRACT = new pTON.v1();

describe("RouterV1", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(RouterV1.version).toBe(DEX_VERSION.v1);
    });
  });

  describe("address", () => {
    it("should have expected static value", () => {
      expect(RouterV1.address).toMatchInlineSnapshot(
        '"EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt"',
      );
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(
        RouterV1.gasConstants.provideLpJetton.forwardGasAmount,
      ).toMatchInlineSnapshot("240000000n");
      expect(
        RouterV1.gasConstants.provideLpJetton.gasAmount,
      ).toMatchInlineSnapshot("300000000n");
      expect(
        RouterV1.gasConstants.provideLpTon.forwardGasAmount,
      ).toMatchInlineSnapshot("260000000n");
      expect(
        RouterV1.gasConstants.swapJettonToJetton.forwardGasAmount,
      ).toMatchInlineSnapshot("175000000n");
      expect(
        RouterV1.gasConstants.swapJettonToJetton.gasAmount,
      ).toMatchInlineSnapshot("220000000n");
      expect(
        RouterV1.gasConstants.swapJettonToTon.forwardGasAmount,
      ).toMatchInlineSnapshot("125000000n");
      expect(
        RouterV1.gasConstants.swapJettonToTon.gasAmount,
      ).toMatchInlineSnapshot("170000000n");
      expect(
        RouterV1.gasConstants.swapTonToJetton.forwardGasAmount,
      ).toMatchInlineSnapshot("185000000n");
    });
  });

  describe("create", () => {
    it("should create an instance of RouterV1 from address", () => {
      const contract = RouterV1.create(RouterV1.address);

      expect(contract).toBeInstanceOf(RouterV1);
    });
  });

  describe("constructor", () => {
    it("should create an instance of RouterV1", () => {
      const contract = new RouterV1();

      expect(contract).toBeInstanceOf(RouterV1);
    });

    it("should create an instance of RouterV1 with default address", () => {
      const contract = new RouterV1();

      expect(contract.address).toEqual(RouterV1.address);
    });

    it("should create an instance of RouterV1 with given address", () => {
      const address = USER_WALLET_ADDRESS; // just an address, not a real Router v1 contract

      const contract = RouterV1.create(address);

      expect(contract.address.toString({ bounceable: false })).toEqual(
        USER_WALLET_ADDRESS,
      );
    });

    it("should create an instance of RouterV1 with default gasConstants", () => {
      const contract = new RouterV1();

      expect(contract.gasConstants).toEqual(RouterV1.gasConstants);
    });

    it("should create an instance of RouterV1 with given gasConstants", () => {
      const gasConstants: Partial<RouterV1["gasConstants"]> = {
        swapJettonToJetton: {
          gasAmount: BigInt("1"),
          forwardGasAmount: BigInt("2"),
        },
      };

      const contract = new RouterV1(RouterV1.address, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createSwapBody", () => {
    const txArgs = {
      userWalletAddress: USER_WALLET_ADDRESS,
      minAskAmount: "900000000",
      askJettonWalletAddress: ASK_JETTON_ADDRESS,
    };

    it("should build expected tx body", async () => {
      const contract = new RouterV1();

      const body = await contract.createSwapBody({
        ...txArgs,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEATgAAlyWThWGACv0V60urLvOuQaFkeeX50FwcarMh5eVv1pd07lIKUvSIa0nSAQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmhCqzILs"',
      );
    });

    it("should build expected tx body when referralAddress is defined", async () => {
      const contract = new RouterV1();

      const body = await contract.createSwapBody({
        ...txArgs,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAbwAA2SWThWGACv0V60urLvOuQaFkeeX50FwcarMh5eVv1pd07lIKUvSIa0nSAQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmjAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKezq+h"',
      );
    });
  });

  describe("getSwapJettonToJettonTxParams", () => {
    const txArgs = {
      userWalletAddress: USER_WALLET_ADDRESS,
      offerJettonAddress: OFFER_JETTON_ADDRESS,
      askJettonAddress: ASK_JETTON_ADDRESS,
      offerAmount: "500000000",
      minAskAmount: "200000000",
    };

    const provider = createMockProviderFromSnapshot((address, method) => {
      if (
        address === txArgs.offerJettonAddress &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOACD+9EGh6wT/2pEbZWrfCmVbsdpQVGU9308qh2gel9QwQM97q5A==",
        );
      }

      if (
        address === txArgs.askJettonAddress &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getSwapJettonToJettonTxParams({
        ...txArgs,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAqQABsA+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBTck4EBAJclk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFqBfXhAEABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oQsE7cRQ=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("220000000n");
    });

    it("should build expected tx params when referralAddress is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getSwapJettonToJettonTxParams({
        ...txArgs,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAygABsA+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBTck4EBANklk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFqBfXhAEABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5owAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmiwUoOyQ=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("220000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getSwapJettonToJettonTxParams({
        ...txArgs,
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAqQABsA+KfqUAAAAAAAAwOUHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBTck4EBAJclk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFqBfXhAEABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oQ/ZI/NA=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("220000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getSwapJettonToJettonTxParams({
        ...txArgs,
        gasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAqQABsA+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBTck4EBAJclk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFqBfXhAEABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oQsE7cRQ=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getSwapJettonToJettonTxParams({
        ...txArgs,
        forwardGasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEApgABqg+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaAgMBAJclk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFqBfXhAEABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oQHS9BEQ=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("220000000n");
    });

    it("should build expected tx params when custom jettonCustomPayload is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getSwapJettonToJettonTxParams({
        ...txArgs,
        jettonCustomPayload: beginCell().storeBit(1).endCell(),
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEArQACsA+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKBTck4EBAgABwACXJZOFYYABAM5g2SPF69zQu52aPmhZDOzP9L2+f39v9XQMt2w5RagX14QBAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaEO0cgYo="',
      );
      expect(txParams.value).toMatchInlineSnapshot("220000000n");
    });
  });

  describe("sendSwapJettonToJetton", () => {
    it("should call getSwapJettonToJettonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<RouterV1["sendSwapJettonToJetton"]>[2];

      const contract = RouterV1.create(RouterV1.address);

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
    const txArgs = {
      userWalletAddress: USER_WALLET_ADDRESS,
      offerJettonAddress: OFFER_JETTON_ADDRESS,
      proxyTon: PTON_CONTRACT,
      offerAmount: "500000000",
      minAskAmount: "200000000",
    };

    const provider = createMockProviderFromSnapshot((address, method) => {
      if (
        address === txArgs.offerJettonAddress &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOACD+9EGh6wT/2pEbZWrfCmVbsdpQVGU9308qh2gel9QwQM97q5A==",
        );
      }

      if (
        address === txArgs.proxyTon.address.toString() &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPwJB4oTQ==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getSwapJettonToTonTxParams({
        ...txArgs,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAqQABsA+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCA7msoEBAJclk4VhgAIqFqMWTE1aoxM/MRD/EEluAMqKyKvv/FAn4CTTNIDD6BfXhAEABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oQv9h8dw=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("170000000n");
    });

    it("should build expected tx params when referralAddress is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getSwapJettonToTonTxParams({
        ...txArgs,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAygABsA+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCA7msoEBANklk4VhgAIqFqMWTE1aoxM/MRD/EEluAMqKyKvv/FAn4CTTNIDD6BfXhAEABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5owAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmi8vLJFA=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("170000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getSwapJettonToTonTxParams({
        ...txArgs,
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAqQABsA+KfqUAAAAAAAAwOUHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCA7msoEBAJclk4VhgAIqFqMWTE1aoxM/MRD/EEluAMqKyKvv/FAn4CTTNIDD6BfXhAEABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oQ8gSfBg=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("170000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getSwapJettonToTonTxParams({
        ...txArgs,
        gasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAqQABsA+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCA7msoEBAJclk4VhgAIqFqMWTE1aoxM/MRD/EEluAMqKyKvv/FAn4CTTNIDD6BfXhAEABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oQv9h8dw=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getSwapJettonToTonTxParams({
        ...txArgs,
        forwardGasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEApgABqg+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaAgMBAJclk4VhgAIqFqMWTE1aoxM/MRD/EEluAMqKyKvv/FAn4CTTNIDD6BfXhAEABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oQyZHaEA=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("170000000n");
    });

    it("should build expected tx params when custom jettonCustomPayload is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getSwapJettonToTonTxParams({
        ...txArgs,
        jettonCustomPayload: beginCell().storeBit(1).endCell(),
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEArQACsA+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKA7msoEBAgABwACXJZOFYYACKhajFkxNWqMTPzEQ/xBJbgDKisir7/xQJ+Ak0zSAw+gX14QBAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaEDVpBRw="',
      );
      expect(txParams.value).toMatchInlineSnapshot("170000000n");
    });
  });

  describe("sendSwapJettonToTon", () => {
    it("should call getSwapJettonToTonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<RouterV1["sendSwapJettonToTon"]>[2];

      const contract = RouterV1.create(RouterV1.address);

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
    const txArgs = {
      userWalletAddress: USER_WALLET_ADDRESS,
      proxyTon: PTON_CONTRACT,
      askJettonAddress: ASK_JETTON_ADDRESS,
      offerAmount: "500000000",
      minAskAmount: "200000000",
    };
    const provider = createMockProviderFromSnapshot((address, method) => {
      if (
        address === txArgs.askJettonAddress &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
        );
      }

      if (
        address === txArgs.proxyTon.address.toString() &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPwJB4oTQ==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getSwapTonToJettonTxParams({
        ...txArgs,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAiAABbQ+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCcECwbgQMBAJclk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFqBfXhAEABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oQ4VeW3A=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("685000000n");
    });

    it("should build expected tx params when referralAddress is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getSwapTonToJettonTxParams({
        ...txArgs,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAqQABbQ+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCcECwbgQMBANklk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFqBfXhAEABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5owAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmi/Fv4ew=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("685000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getSwapTonToJettonTxParams({
        ...txArgs,
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAiAABbQ+KfqUAAAAAAAAwOUHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCcECwbgQMBAJclk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFqBfXhAEABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oQq/XlXw=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("685000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getSwapTonToJettonTxParams({
        ...txArgs,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAiAABbQ+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCcECwbgQMBAJclk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFqBfXhAEABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oQ4VeW3A=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("685000000n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getSwapTonToJettonTxParams({
        ...txArgs,
        forwardGasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAhQABZw+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCcBAcBAJclk4VhgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFqBfXhAEABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oQoDsKGA=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("500000001n");
    });
  });

  describe("sendSwapTonToJetton", () => {
    it("should call getSwapTonToJettonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<RouterV1["sendSwapTonToJetton"]>[2];

      const contract = RouterV1.create(RouterV1.address);

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
    const txArgs = {
      routerWalletAddress: "EQAIBnMGyR4vXuaF3OzR80LIZ2Z_pe3z-_t_q6Blu2HKLeaY",
      minLpOut: "900000000",
    };

    it("should build expected tx body", async () => {
      const contract = new RouterV1();

      const body = await contract.createProvideLiquidityBody({
        ...txArgs,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEALAAAU/z55Y+AAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWoa0nSAdDW3xU="',
      );
    });
  });

  describe("getProvideLiquidityJettonTxParams", () => {
    const txArgs = {
      userWalletAddress: USER_WALLET_ADDRESS,
      sendTokenAddress: OFFER_JETTON_ADDRESS,
      otherTokenAddress: ASK_JETTON_ADDRESS,
      sendAmount: "500000000",
      minLpOut: "1",
    };

    const provider = createMockProviderFromSnapshot((address, method) => {
      if (
        address === txArgs.sendTokenAddress &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOACD+9EGh6wT/2pEbZWrfCmVbsdpQVGU9308qh2gel9QwQM97q5A==",
        );
      }

      if (
        address === txArgs.otherTokenAddress &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getProvideLiquidityJettonTxParams({
        ...txArgs,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAhAABsA+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAE38+eWPgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFogMsmgJ2"',
      );
      expect(txParams.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getProvideLiquidityJettonTxParams({
        ...txArgs,
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAhAABsA+KfqUAAAAAAAAwOUHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAE38+eWPgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFogOYpqed"',
      );
      expect(txParams.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getProvideLiquidityJettonTxParams({
        ...txArgs,
        gasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAhAABsA+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAE38+eWPgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFogMsmgJ2"',
      );
      expect(txParams.value).toMatchInlineSnapshot("1n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getProvideLiquidityJettonTxParams({
        ...txArgs,
        forwardGasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAgQABqg+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaAgMBAE38+eWPgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFogOQPo8V"',
      );
      expect(txParams.value).toMatchInlineSnapshot("300000000n");
    });

    it("should build expected tx params when custom jettonCustomPayload is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getProvideLiquidityJettonTxParams({
        ...txArgs,
        jettonCustomPayload: beginCell().storeBit(1).endCell(),
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEAiAACsA+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKBycOAEBAgABwABN/Pnlj4ABAM5g2SPF69zQu52aPmhZDOzP9L2+f39v9XQMt2w5RaIDh3HFeg=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("300000000n");
    });
  });

  describe("sendProvideLiquidityJetton", () => {
    it("should call getProvideLiquidityJettonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<
        RouterV1["sendProvideLiquidityJetton"]
      >[2];

      const contract = RouterV1.create(RouterV1.address);

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
    const txArgs = {
      userWalletAddress: USER_WALLET_ADDRESS,
      otherTokenAddress: OFFER_JETTON_ADDRESS,
      proxyTon: PTON_CONTRACT,
      sendAmount: "500000000",
      minLpOut: "1",
    };

    const provider = createMockProviderFromSnapshot((address, method) => {
      if (
        address === txArgs.otherTokenAddress &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
        );
      }

      if (
        address === txArgs.proxyTon.address.toString() &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPwJB4oTQ==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getProvideLiquidityTonTxParams({
        ...txArgs,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAYwABbQ+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCcED39JAMBAE38+eWPgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFogPLyEMA"',
      );
      expect(txParams.value).toMatchInlineSnapshot("760000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getProvideLiquidityTonTxParams({
        ...txArgs,
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAYwABbQ+KfqUAAAAAAAAwOUHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCcED39JAMBAE38+eWPgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFogOsHyfF"',
      );
      expect(txParams.value).toMatchInlineSnapshot("760000000n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(new RouterV1());

      const txParams = await contract.getProvideLiquidityTonTxParams({
        ...txArgs,
        forwardGasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAYAABZw+KfqUAAAAAAAAAAEHc1lAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCcBAcBAE38+eWPgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFogP+/0aI"',
      );
      expect(txParams.value).toMatchInlineSnapshot("500000001n");
    });
  });

  describe("sendProvideLiquidityTon", () => {
    it("should call getProvideLiquidityTonTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<RouterV1["sendProvideLiquidityTon"]>[2];

      const contract = RouterV1.create(RouterV1.address);

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

  describe("getPoolAddress", () => {
    const snapshot = createProviderSnapshot().cell(
      "te6ccsEBAQEAJAAAAEOAFL81j9ygFp1c3p71Zs3Um3CwytFAzr8LITNsQqQYk1nQDFEwYA==",
    );
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(new RouterV1());

      const poolAddress = await contract.getPoolAddress({
        token0:
          "0:87b92241aa6a57df31271460c109c54dfd989a1aea032f6107d2c65d6e8879ce",
        token1:
          "0:9f557c3e09518b8a73bccfef561896832a35b220e85df1f66834b2170db0dfcb",
      });

      expect(poolAddress).toMatchInlineSnapshot(
        '"EQCl-ax-5QC06ub096s2bqTbhYZWigZ1-FkJm2IVIMSazp7U"',
      );
    });
  });

  describe("getPool", () => {
    it("should return Pool instance for existing pair", async () => {
      const provider = createMockProviderFromSnapshot((address, method) => {
        if (
          address === RouterV1.address.toString() &&
          method === "get_pool_address"
        ) {
          return createProviderSnapshot().cell(
            "te6ccsEBAQEAJAAAAEOABTuxjU0JqtDko8O1p92eNHHiuy6flx275gE6iecPgD8Q0X0lFw==",
          );
        }

        if (
          address === OFFER_JETTON_ADDRESS &&
          method === "get_wallet_address"
        ) {
          return createProviderSnapshot().cell(
            "te6ccsEBAQEAJAAAAEOAFyFIKPdQf9SwP1GudjklnwW5klYY2/JJh4CqeuJ2a82QaHOF8w==",
          );
        }

        if (address === ASK_JETTON_ADDRESS && method === "get_wallet_address") {
          return createProviderSnapshot().cell(
            "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
          );
        }

        throw new Error(`Unexpected call: ${address} ${method}`);
      });

      const contract = provider.open(new RouterV1());

      const pool = await contract.getPool({
        token0: OFFER_JETTON_ADDRESS,
        token1: ASK_JETTON_ADDRESS,
      });

      expect(pool).toBeInstanceOf(PoolV1);
    });
  });

  describe("getRouterData", () => {
    const snapshot = createProviderSnapshot()
      .number("0")
      .cell(
        "te6ccsEBAQEAJAAAAEOACTN3gl9yZ6lMTviWYFH4dL8SUXFIMHH8M+HgXr/0324Q2cH+VQ==",
      )
      .cell("te6ccsEBAgEAFgAAFAEhAAAAAAAAAAAAAAAAAAAAACABAAAAkbB8")
      .cell(
        "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",
      )
      .cell(
        "te6ccsECDwEAAxUAAAAADQASABcAdQB6AH8A/QFVAVoB2gIUAlQCwgMFART/APSkE/S88sgLAQIBYgIOAgLMAwQAt9kGOASS+CcADoaYGAuNhKia+B+AZwfSB9IBj9ABi465D9ABj9ABgBaY+QwQgHxT9S3UqYmiz4BPAQwQgLxqKM3UsYoiIB+AVwGsEILK+D3l1JrPgF8C+CQgf5eEAgEgBQ0CASAGCAH1UD0z/6APpAcCKAVQH6RDBYuvL07UTQ+gD6QPpA1DBRNqFSKscF8uLBKML/8uLCVDRCcFQgE1QUA8hQBPoCWM8WAc8WzMkiyMsBEvQA9ADLAMkg+QBwdMjLAsoHy//J0AT6QPQEMfoAINdJwgDy4sR3gBjIywVQCM8WcIBwCs+gIXy2sTzIIQF41FGcjLHxnLP1AH+gIizxZQBs8WJfoCUAPPFslQBcwjkXKRceJQCKgToIIJycOAoBS88uLFBMmAQPsAECPIUAT6AljPFgHPFszJ7VQCASAJDAL3O1E0PoA+kD6QNQwCNM/+gBRUaAF+kD6QFNbxwVUc21wVCATVBQDyFAE+gJYzxYBzxbMySLIywES9AD0AMsAyfkAcHTIywLKB8v/ydBQDccFHLHy4sMK+gBRqKGCCJiWgGa2CKGCCJiWgKAYoSeXEEkQODdfBOMNJdcLAYAoLAHBSeaAYoYIQc2LQnMjLH1Iwyz9Y+gJQB88WUAfPFslxgBjIywUkzxZQBvoCFctqFMzJcfsAECQQIwB8wwAjwgCwjiGCENUydttwgBDIywVQCM8WUAT6AhbLahLLHxLLP8ly+wCTNWwh4gPIUAT6AljPFgHPFszJ7VQA1ztRND6APpA+kDUMAfTP/oA+kAwUVGhUknHBfLiwSfC//LiwgWCCTEtAKAWvPLiw4IQe92X3sjLHxXLP1AD+gIizxYBzxbJcYAYyMsFJM8WcPoCy2rMyYBA+wBAE8hQBPoCWM8WAc8WzMntVIACB1AEGuQ9qJofQB9IH0gahgCaY+QwQgLxqKM3QFBCD3uy+9dCVj5cWLpn5j9ABgJ0CgR5CgCfQEsZ4sA54tmZPaqQAG6D2BdqJofQB9IH0gahhq3vDTA==",
      )
      .cell(
        "te6ccsECDAEAAo0AAAAADQASAGkA5wFGAckB4QIBAhcCUQJpART/APSkE/S88sgLAQIBYgILA6TQIMcAkl8E4AHQ0wPtRND6QAH4YfpAAfhi+gAB+GP6ADD4ZAFxsJJfBOD6QDBwIYBVAfpEMFi68vQB0x/TP/hCUkDHBeMC+EFSQMcF4wI0NEMTAwQJAfYzVSFsIQKCED6+VDG6juUB+gD6APoAMPhDUAOg+GP4RAGg+GT4Q4ED6Lz4RIED6LywUhCwjqeCEFbf64rIyx8Syz/4Q/oC+ET6AvhBzxYB+gL4QgHJ2zxw+GNw+GSRW+LI+EHPFvhCzxb4Q/oC+ET6AsntVJVbhA/y8OIKArYzVSExI4IQC/P0R7qOyxAjXwP4Q8IA+ETCALHy4FCCEIlEakLIyx/LP/hD+gL4RPoC+EHPFnD4QgLJEoBA2zxw+GNw+GTI+EHPFvhCzxb4Q/oC+ET6AsntVOMOBgUC/iOCEEz4KAO6juoxbBL6APoA+gAwIoED6LwigQPovLBSELDy4FH4QyOh+GP4RCKh+GT4Q8L/+ETC/7Dy4FCCEFbf64rIyx8Uyz9Y+gIB+gL4Qc8WAfoCcPhCAskSgEDbPMj4Qc8W+ELPFvhD+gL4RPoCye1U4DAxAYIQQqD7Q7oGBwAscYAYyMsFUATPFlAE+gISy2rMyQH7AAE6jpUgggiYloC88uBTggiYloCh+EFw2zzgMIQP8vAIAChwgBjIywVQA88WUAP6AstqyQH7AAFuMHB0+wICghAdQ5rguo6fghAdQ5rgyMsfyz/4Qc8W+ELPFvhD+gL4RPoCyds8f5JbcOLchA/y8AoALHGAGMjLBVADzxZw+gISy2rMyYMG+wAAQ6G6bdqJofSAA/DD9IAD8MX0AAPwx/QAYfDJ8IPwhfCH8InFhJmX",
      );
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(new RouterV1());

      const data = await contract.getRouterData();

      expect(data.isLocked).toBe(false);
      expect(data.adminAddress).toMatchInlineSnapshot(
        '"EQBJm7wS-5M9SmJ3xLMCj8Ol-JKLikGDj-GfDwL1_6b7cENC"',
      );
      expect(data.tempUpgrade.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAFgABIQAAAAAAAAAAAAAAAAAAAAAgAQAAnpyZMQ=="',
      );
      expect(data.poolCode.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckECOgEAEFMAART/APSkE/S88sgLAQIBYgIoAgLNAyYD8dEGOASS+CcADoaYGAuNhJL4JwdqJofSAA/DDpg4D8MWmDgPwx6YOA/DJ9IAD8Mv0gAPwzfQAA/DPqAOh9AAD8NH0AAPw0/SAA/DV9AAD8Nf0AGHw2agD8NuoYfDd9IAFpj+mfkUEIPe7L711xgRFBCCtv9cVdcYERQEBgoC/jI1+gD6QPpAMIFhqHDbPAX6QDH6ADFx1yH6ADFTZbwB+gAwpwZScLyw8uBT+Cj4TSNZcFQgE1QUA8hQBPoCWM8WAc8WzMkiyMsBEvQA9ADLAMn5AHB0yMsCygfL/8nQUATHBfLgUiHCAPLgUfhLUiCo+EepBPhMUjCo+EepBCEaBQOwwgAhwgCw8uBR+Esiofhr+Ewhofhs+EdQBKH4Z3CAQCXXCwHDAI6dW1BUoasAcIIQ1TJ228jLH1Jwyz/JVEJVcts8AwSVECc1NTDiEDVAFIIQ3aSLagLbPB0cFgL+MmwzAfoA+gD6QPoAMPgo+E4jWXBTABA1ECTIUATPFljPFgH6AgH6AskhyMsBE/QAEvQAywDJIPkAcHTIywLKB8v/ydAnxwXy4FL4R8AAjhb4R1JQqPhLqQT4R1JQqPhMqQS2CFAD4w34Syag+Gv4TCWg+Gz4RyKg+GdSE7n4SwcIAMAyXaggwACOUIEAtVMRg3++mTGrf4EAtao/Ad4ggz++lqs/AaofAd4ggx++lqsfAaoPAd4ggw++lqsPAaoHAd6DD6CoqxF3llypBKCrAORmqQRcuZEwkTHi34ED6KkEiwID3IR3vPhMhHe8sbGPYDQ1WxL4KPhNI1lwVCATVBQDyFAE+gJYzxYBzxbMySLIywES9AD0AMsAySD5AHB0yMsCygfL/8nQcIIQF41FGcjLHxbLP1AD+gL4KM8WUAPPFiP6AhPLAHAByUMwgEDbPOMNEhYJAT5bghA+vlQxyMsfFMs/WPoCAfoCcPoCcAHJQzCAQts8EgT+ghCJRGpCuo7XMmwzAfoA+gD6QDD4KPhOIllwUwAQNRAkyFAEzxZYzxYB+gIB+gLJIcjLARP0ABL0AMsAyfkAcHTIywLKB8v/ydBQBccF8uBScIBABEVTghDefbvCAts84PhBUkDHBY8VMzNEFFAzjwzt+ySCECWThWG64w/Y4BwLERgEijIz+kD6QPoA+gDTANQw0PpAcCCLAoBAUyaOkV8DIIFhqCHbPByhqwAD+kAwkjU84vhFGccF4w/4R8EBJMEBUZW+GbEYsRoMDQ4AmDH4S/hMJxA2WYEnEPhCoROoUgOoAYEnEKhYoKkEcCD4Q8IAnDH4Q1IgqIEnEKkGAd74RMIAFLCcMvhEUhCogScQqQYC3lMCoBKhAicAmjD4TPhLJxA2WYEnEPhCoROoUgOoAYEnEKhYoKkEcCD4Q8IAnDH4Q1IgqIEnEKkGAd74RMIAFLCcMvhEUhCogScQqQYC3lMCoBKhAicGA66OlF8EbDM0cIBABEVTghBf/hKVAts84CbjD/hO+E3I+Ej6AvhJ+gL4Ss8W+Ev6AvhM+gLJ+ET4Q/hCyPhBzxbLB8sHywf4Rc8W+EbPFvhH+gLMzMzJ7VQcDxAD0PhLUAig+Gv4TFMhoCigofhs+EkBoPhp+EuEd7z4TMEBsY6VW2wzNHCAQARFU4IQOJdumwLbPNsx4GwiMibAAI6VJnKxghBFB4VAcCNRWQQFUIdDMNs8kmwi4gRDE4IQxkNw5VhwAds8HBwcA8z4S12gIqCh+Gv4TFAIoPhs+EgBoPho+EyEd7z4S8EBsY6VW2wzNHCAQARFU4IQOJdumwLbPNsx4GwiMibAAI6VJnKxghBFB4VAcCNRWQQFCENz2zwBkmwi4gRDE4IQxkNw5Vhw2zwcHBwD9DEjghD8+eWPuo7iMWwS+kD6APoA+gAw+Cj4ThAlcFMAEDUQJMhQBM8WWM8WAfoCAfoCySHIywET9AAS9ADLAMkg+QBwdMjLAsoHy//J0IIQPr5UMcjLHxbLP1j6AlAD+gIB+gJwAclDMIBA2zzgI4IQQqD7Q7rjAjEiEhMVAC53gBjIywVQBc8WUAX6AhPLa8zMyQH7AAEcE18DggiYloCh+EFw2zwUAChwgBjIywVQA88WUAP6AstqyQH7AAPUghAfy309uo9QMDH4SMIA+EnCALDy4FD4So0IYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMcFs/LgW3CAQPhKIvhI+EkQVhBF2zxw+Ghw+GngMQGCEDVUI+W64wIwhA/y8BwWFwB6+E74Tcj4SPoC+En6AvhKzxb4S/oC+Ez6Asn4RPhD+ELI+EHPFssHywfLB/hFzxb4Rs8W+Ef6AszMzMntVADQ0wfTB9MH+kAwfyTBZbDy4FV/I8FlsPLgVX8iwWWw8uBVA/hiAfhj+GT4avhO+E3I+Ej6AvhJ+gL4Ss8W+Ev6AvhM+gLJ+ET4Q/hCyPhBzxbLB8sHywf4Rc8W+EbPFvhH+gLMzMzJ7VQD5DYhghAfy309uuMCA/pAMfoAMXHXIfoAMfoAMARDNXB0+wIjghBDwDTmuo6/MGwiMvhE+EP4QsjLB8sHywf4Ss8W+Ej6AvhJ+gLJghBDwDTmyMsfEss/+Ev6AvhM+gL4Rc8W+EbPFszJ2zx/4w7chA/y8BklHgL+MTIz+EeBA+i88uBQ+EiCCA9CQLz4SYIID0JAvLDy4Fj4So0IYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMcFs/LgW4IAnEBw2zxTIKGCEDuaygC88uBTEqGrAfhIgQPoqQT4SYED6KkE+Egiofho+EkhofhpIRobAUTA/5SAFPgzlIAV+DPi0Ns8bBNduZMTXwOYWqEBqw+oAaDiJwLkwgAhwgCw8uBR+EjCAPhJwgCw8uBRIqcDcPhKIfhI+EkpVTDbPBAkcgRDE3AC2zxw+Ghw+Gn4TvhNyPhI+gL4SfoC+ErPFvhL+gL4TPoCyfhE+EP4Qsj4Qc8WywfLB8sH+EXPFvhGzxb4R/oCzMzMye1UHBwBXMhY+gL4Rc8WAfoC+EbPFslxghD5O7Q/yMsfFcs/UAPPFssfEssAzPhBAclY2zwdACxxgBDIywVQBM8WUAT6AhLLaszJAfsABOojghDtTYtnuuMCI4IQkWOpirqOzmwz+kAwghDtTYtnyMsfE8s/+Cj4ThAkcFMAEDUQJMhQBM8WWM8WAfoCAfoCySHIywET9AAS9ADLAMn5AHB0yMsCygfL/8nQEs8Wyds8f+AjghCc5jLFuuMCI4IQh1GAH7ofJSIjAvxsM/hHgQPovPLgUPoA+kAwcHBTEfhFUlDHBY5OXwR/cPhL+EwlWYEnEPhCoROoUgOoAYEnEKhYoKkEcCD4Q8IAnDH4Q1IgqIEnEKkGAd74RMIAFLCcMvhEUhCogScQqQYC3lMCoBKhAhAj3vhGFccFkTTjDfLgVoIQ7U2LZ8ggIQCgXwR/cPhM+EsQIxAkgScQ+EKhE6hSA6gBgScQqFigqQRwIPhDwgCcMfhDUiCogScQqQYB3vhEwgAUsJwy+ERSEKiBJxCpBgLeUwKgEqECQAMBNssfFcs/JMEBkjRwkQTiFPoCAfoCWPoCyds8fyUBXGwz+kAx+gD6ADD4R6j4S6kE+EcSqPhMqQS2CIIQnOYyxcjLHxPLP1j6AsnbPH8lApiOvGwz+gAwIMIA8uBR+EtSEKj4R6kE+EwSqPhHqQQhwgAhwgCw8uBRghCHUYAfyMsfFMs/AfoCWPoCyds8f+ADghAsdrlzuuMCXwVwJSQB4AOCCJiWgKAUvPLgS/pA0wAwlcghzxbJkW3ighDRc1QAyMsfFMs/IfpEMMAAjjX4KPhNECNwVCATVBQDyFAE+gJYzxYBzxbMySLIywES9AD0AMsAyfkAcHTIywLKB8v/ydDPFpRwMssB4hL0AMnbPH8lACxxgBjIywVQA88WcPoCEstqzMmDBvsAAQHUJwBY0wchgQDRupwx0z/TP1kC8ARsIRPgIYEA3roCgQDduhKxltM/AXBSAuBwUwACASApMQIBICorAMG78Z7UTQ+kAB+GHTBwH4YtMHAfhj0wcB+GT6QAH4ZfpAAfhm+gAB+GfUAdD6AAH4aPoAAfhp+kAB+Gr6AAH4a/oAMPhs1AH4bdQw+G74S/hM+EX4RvhC+EP4RPhK+Ej4SYAgEgLC4BobainaiaH0gAPww6YOA/DFpg4D8MemDgPwyfSAA/DL9IAD8M30AAPwz6gDofQAA/DR9AAD8NP0gAPw1fQAA/DX9ABh8NmoA/DbqGHw3fBR8J0C0AYHBTABA1ECTIUATPFljPFgH6AgH6AskhyMsBE/QAEvQAywDJ+QBwdMjLAsoHy//J0AIBbi8wALyofu1E0PpAAfhh0wcB+GLTBwH4Y9MHAfhk+kAB+GX6QAH4ZvoAAfhn1AHQ+gAB+Gj6AAH4afpAAfhq+gAB+Gv6ADD4bNQB+G3UMPhu+EcSqPhLqQT4RxKo+EypBLYIANqpA+1E0PpAAfhh0wcB+GLTBwH4Y9MHAfhk+kAB+GX6QAH4ZvoAAfhn1AHQ+gAB+Gj6AAH4afpAAfhq+gAB+Gv6ADD4bNQB+G3UMPhuIMIA8uBR+EtSEKj4R6kE+EwSqPhHqQQhwgAhwgCw8uBRAgEgMjcCAWYzNAD7rbz2omh9IAD8MOmDgPwxaYOA/DHpg4D8Mn0gAPwy/SAA/DN9AAD8M+oA6H0AAPw0fQAA/DT9IAD8NX0AAPw1/QAYfDZqAPw26hh8N3wUfCa4KhAJqgoB5CgCfQEsZ4sA54tmZJFkZYCJegB6AGWAZPyAODpkZYFlA+X/5OhAAeGvFvaiaH0gAPww6YOA/DFpg4D8MemDgPwyfSAA/DL9IAD8M30AAPwz6gDofQAA/DR9AAD8NP0gAPw1fQAA/DX9ABh8NmoA/DbqGHw3fBR9Ihi45GWDxoKtDo6ODmdF5e2OBc5uje3FzM0l5gdQZ4sAwDUB/iDAAI4YMMhwkyDBQJeAMFjLBwGk6AHJ0AGqAtcZjkwgkyDDAJKrA+gwgA/IkyLDAI4XUyGwIMIJlaY3AcsHlaYwAcsH4gKrAwLoMcgyydCAQJMgwgCdpSCqAlIgeNckE88WAuhbydCDCNcZ4s8Wi1Lmpzb26M8WyfhHf/hB+E02AAgQNEEwAuO4P97UTQ+kAB+GHTBwH4YtMHAfhj0wcB+GT6QAH4ZfpAAfhm+gAB+GfUAdD6AAH4aPoAAfhp+kAB+Gr6AAH4a/oAMPhs1AH4bdQw+G74R4ED6Lzy4FBwUwD4RVJAxwXjAPhGFMcFkTPjDSDBAJIwcN5Zg4OQCWXwNw+Ev4TCRZgScQ+EKhE6hSA6gBgScQqFigqQRwIPhDwgCcMfhDUiCogScQqQYB3vhEwgAUsJwy+ERSEKiBJxCpBgLeUwKgEqECAJhfA3D4TPhLECOBJxD4QqETqFIDqAGBJxCoWKCpBHAg+EPCAJwx+ENSIKiBJxCpBgHe+ETCABSwnDL4RFIQqIEnEKkGAt5TAqASoQJYAYrLkw=="',
      );
      expect(
        data.jettonLpWalletCode.toBoc().toString("base64"),
      ).toMatchInlineSnapshot(
        '"te6cckECDwEAAxUAART/APSkE/S88sgLAQIBYgIOAgLMAwQAt9kGOASS+CcADoaYGAuNhKia+B+AZwfSB9IBj9ABi465D9ABj9ABgBaY+QwQgHxT9S3UqYmiz4BPAQwQgLxqKM3UsYoiIB+AVwGsEILK+D3l1JrPgF8C+CQgf5eEAgEgBQ0CASAGCAH1UD0z/6APpAcCKAVQH6RDBYuvL07UTQ+gD6QPpA1DBRNqFSKscF8uLBKML/8uLCVDRCcFQgE1QUA8hQBPoCWM8WAc8WzMkiyMsBEvQA9ADLAMkg+QBwdMjLAsoHy//J0AT6QPQEMfoAINdJwgDy4sR3gBjIywVQCM8WcIBwCs+gIXy2sTzIIQF41FGcjLHxnLP1AH+gIizxZQBs8WJfoCUAPPFslQBcwjkXKRceJQCKgToIIJycOAoBS88uLFBMmAQPsAECPIUAT6AljPFgHPFszJ7VQCASAJDAL3O1E0PoA+kD6QNQwCNM/+gBRUaAF+kD6QFNbxwVUc21wVCATVBQDyFAE+gJYzxYBzxbMySLIywES9AD0AMsAyfkAcHTIywLKB8v/ydBQDccFHLHy4sMK+gBRqKGCCJiWgGa2CKGCCJiWgKAYoSeXEEkQODdfBOMNJdcLAYAoLAHBSeaAYoYIQc2LQnMjLH1Iwyz9Y+gJQB88WUAfPFslxgBjIywUkzxZQBvoCFctqFMzJcfsAECQQIwB8wwAjwgCwjiGCENUydttwgBDIywVQCM8WUAT6AhbLahLLHxLLP8ly+wCTNWwh4gPIUAT6AljPFgHPFszJ7VQA1ztRND6APpA+kDUMAfTP/oA+kAwUVGhUknHBfLiwSfC//LiwgWCCTEtAKAWvPLiw4IQe92X3sjLHxXLP1AD+gIizxYBzxbJcYAYyMsFJM8WcPoCy2rMyYBA+wBAE8hQBPoCWM8WAc8WzMntVIACB1AEGuQ9qJofQB9IH0gahgCaY+QwQgLxqKM3QFBCD3uy+9dCVj5cWLpn5j9ABgJ0CgR5CgCfQEsZ4sA54tmZPaqQAG6D2BdqJofQB9IH0gahhBFRjBw=="',
      );
      expect(
        data.lpAccountCode.toBoc().toString("base64"),
      ).toMatchInlineSnapshot(
        '"te6cckECDAEAAo0AART/APSkE/S88sgLAQIBYgILA6TQIMcAkl8E4AHQ0wPtRND6QAH4YfpAAfhi+gAB+GP6ADD4ZAFxsJJfBOD6QDBwIYBVAfpEMFi68vQB0x/TP/hCUkDHBeMC+EFSQMcF4wI0NEMTAwQJAfYzVSFsIQKCED6+VDG6juUB+gD6APoAMPhDUAOg+GP4RAGg+GT4Q4ED6Lz4RIED6LywUhCwjqeCEFbf64rIyx8Syz/4Q/oC+ET6AvhBzxYB+gL4QgHJ2zxw+GNw+GSRW+LI+EHPFvhCzxb4Q/oC+ET6AsntVJVbhA/y8OIKArYzVSExI4IQC/P0R7qOyxAjXwP4Q8IA+ETCALHy4FCCEIlEakLIyx/LP/hD+gL4RPoC+EHPFnD4QgLJEoBA2zxw+GNw+GTI+EHPFvhCzxb4Q/oC+ET6AsntVOMOBgUC/iOCEEz4KAO6juoxbBL6APoA+gAwIoED6LwigQPovLBSELDy4FH4QyOh+GP4RCKh+GT4Q8L/+ETC/7Dy4FCCEFbf64rIyx8Uyz9Y+gIB+gL4Qc8WAfoCcPhCAskSgEDbPMj4Qc8W+ELPFvhD+gL4RPoCye1U4DAxAYIQQqD7Q7oGBwAscYAYyMsFUATPFlAE+gISy2rMyQH7AAE6jpUgggiYloC88uBTggiYloCh+EFw2zzgMIQP8vAIAChwgBjIywVQA88WUAP6AstqyQH7AAFuMHB0+wICghAdQ5rguo6fghAdQ5rgyMsfyz/4Qc8W+ELPFvhD+gL4RPoCyds8f5JbcOLchA/y8AoALHGAGMjLBVADzxZw+gISy2rMyYMG+wAAQ6G6bdqJofSAA/DD9IAD8MX0AAPwx/QAYfDJ8IPwhfCH8IlVQIbq"',
      );
    });
  });
});
