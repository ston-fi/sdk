import TonWeb from "tonweb";
import { describe, it, expect, vi } from "vitest";

import { createMockObj } from "@/test-utils";

import { DEX_VERSION } from "../constants";

import { RouterV1 } from "./RouterV1";
import { PoolV1 } from "./PoolV1";

const {
  utils: { BN, bytesToBase64, base64ToBytes },
  boc: { Cell },
  Address,
} = TonWeb;

const OFFER_JETTON_ADDRESS = "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO"; // STON
const ASK_JETTON_ADDRESS = "EQBX6K9aXVl3nXINCyPPL86C4ONVmQ8vK360u6dykFKXpHCa"; // GEMSTON
const PTON_ADDRESS = "EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez"; // pTON v1
const USER_WALLET_ADDRESS = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";

const DEPENDENCIES = {
  address: RouterV1.address,
  tonApiClient: createMockObj<InstanceType<typeof TonWeb.HttpProvider>>(),
};

describe("RouterV1", () => {
  describe("version", () => {
    it("should have expected static value", () => {
      expect(RouterV1.version).toBe(DEX_VERSION.v1);
    });
  });

  describe("address", () => {
    it("should have expected static value", () => {
      expect(RouterV1.address.toString()).toMatchInlineSnapshot(
        '"EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt"',
      );
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(RouterV1.gasConstants).toMatchInlineSnapshot(
        `
        {
          "provideLpJetton": {
            "forwardGasAmount": "0e4e1c00",
            "gasAmount": "11e1a300",
          },
          "provideLpTon": {
            "forwardGasAmount": "0f7f4900",
          },
          "swapJettonToJetton": {
            "forwardGasAmount": "0c380d40",
            "gasAmount": "0fcb9440",
          },
          "swapJettonToTon": {
            "forwardGasAmount": "07735940",
            "gasAmount": "0b06e040",
          },
          "swapTonToJetton": {
            "forwardGasAmount": "0cd0a3c0",
          },
        }
      `,
      );
    });
  });

  describe("constructor", () => {
    it("should create an instance of RouterV1", () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
      });

      expect(contract).toBeInstanceOf(RouterV1);
    });

    it("should create an instance of RouterV1 with default address", () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        address: undefined,
      });

      expect(contract.address).toEqual(RouterV1.address);
    });

    it("should create an instance of RouterV1 with given address", () => {
      const address = USER_WALLET_ADDRESS; // just an address, not a real Router v1 contract

      const contract = new RouterV1({
        ...DEPENDENCIES,
        address,
      });

      expect(contract.address).toEqual(new Address(address));
    });

    it("should create an instance of RouterV1 with default gasConstants", () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
      });

      expect(contract.gasConstants).toEqual(RouterV1.gasConstants);
    });

    it("should create an instance of RouterV1 with given gasConstants", () => {
      const gasConstants: Partial<RouterV1["gasConstants"]> = {
        swapJettonToJetton: {
          gasAmount: new BN("1"),
          forwardGasAmount: new BN("2"),
        },
      };

      const contract = new RouterV1({
        ...DEPENDENCIES,
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createSwapBody", () => {
    const txArguments = {
      userWalletAddress: USER_WALLET_ADDRESS,
      minAskAmount: new BN("900000000"),
      askJettonWalletAddress: ASK_JETTON_ADDRESS,
    };

    it("should build expected tx body", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
      });

      const body = await contract.createSwapBody({
        ...txArguments,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEATgAAAJclk4VhgAr9FetLqy7zrkGhZHnl+dBcHGqzIeXlb9aXdO5SClL0iGtJ0gEABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oQMOFxRA=="',
      );
    });

    it("should build expected tx body when referralAddress is defined", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
      });

      const body = await contract.createSwapBody({
        ...txArguments,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAbwAAANklk4VhgAr9FetLqy7zrkGhZHnl+dBcHGqzIeXlb9aXdO5SClL0iGtJ0gEABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5owAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmiCx1S/A=="',
      );
    });
  });

  describe("buildSwapJettonToJettonTxParams", () => {
    const txArguments = {
      userWalletAddress: USER_WALLET_ADDRESS,
      offerJettonAddress: OFFER_JETTON_ADDRESS,
      askJettonAddress: ASK_JETTON_ADDRESS,
      offerAmount: new BN("500000000"),
      minAskAmount: new BN("200000000"),
    };

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn(async (...args) => {
        if (
          args[0] === txArguments.offerJettonAddress &&
          args[1] === "get_wallet_address"
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              "te6ccsEBAQEAJAAAAEOACD+9EGh6wT/2pEbZWrfCmVbsdpQVGU9308qh2gel9QwQM97q5A==",
            ),
          );
        }

        if (
          args[0] === txArguments.askJettonAddress &&
          args[1] === "get_wallet_address"
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
            ),
          );
        }

        throw new Error(`Unexpected call2: ${args}`);
      }),
    });

    it("should build expected tx params", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildSwapJettonToJettonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAqQAAWwGwD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJ0ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oIGHAagQEAlyWThWGAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWoF9eEAQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmhAmw6cP"',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"0fcb9440"');
    });

    it("should build expected tx params when referralAddress is defined", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildSwapJettonToJettonTxParams({
        ...txArguments,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAygAAWwGwD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJ0ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oIGHAagQEA2SWThWGAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWoF9eEAQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmjAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIFkUf9"',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"0fcb9440"');
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildSwapJettonToJettonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAqQAAWwGwD4p+pQAAAAAAADA5QdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJ0ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oIGHAagQEAlyWThWGAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWoF9eEAQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmhBrH0R+"',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"0fcb9440"');
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildSwapJettonToJettonTxParams({
        ...txArguments,
        gasAmount: new BN("1"),
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAqQAAWwGwD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJ0ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oIGHAagQEAlyWThWGAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWoF9eEAQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmhAmw6cP"',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"01"');
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildSwapJettonToJettonTxParams({
        ...txArguments,
        forwardGasAmount: new BN("1"),
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEApgAAWAGqD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJ0ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oCAwEAlyWThWGAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWoF9eEAQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmhDajGgi"',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"0fcb9440"');
    });
  });

  describe("buildSwapJettonToTonTxParams", () => {
    const txArguments = {
      userWalletAddress: USER_WALLET_ADDRESS,
      offerJettonAddress: OFFER_JETTON_ADDRESS,
      proxyTonAddress: PTON_ADDRESS,
      offerAmount: new BN("500000000"),
      minAskAmount: new BN("200000000"),
    };

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn(async (...args) => {
        if (
          args[0] === txArguments.offerJettonAddress &&
          args[1] === "get_wallet_address"
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              "te6ccsEBAQEAJAAAAEOACD+9EGh6wT/2pEbZWrfCmVbsdpQVGU9308qh2gel9QwQM97q5A==",
            ),
          );
        }

        if (
          args[0] === txArguments.proxyTonAddress &&
          args[1] === "get_wallet_address"
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              "te6ccsEBAQEAJAAAAEOAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPwJB4oTQ==",
            ),
          );
        }

        throw new Error(`Unexpected call2: ${args}`);
      }),
    });

    it("should build expected tx params", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildSwapJettonToTonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAqQAAWwGwD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJ0ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oIDuaygQEAlyWThWGAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPoF9eEAQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmhDDsZYz"',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"0b06e040"');
    });

    it("should build expected tx params when referralAddress is defined", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildSwapJettonToTonTxParams({
        ...txArguments,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAygAAWwGwD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJ0ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oIDuaygQEA2SWThWGAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPoF9eEAQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmjAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaJQKl1x"',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"0b06e040"');
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildSwapJettonToTonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAqQAAWwGwD4p+pQAAAAAAADA5QdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJ0ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oIDuaygQEAlyWThWGAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPoF9eEAQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmhCObXVC"',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"0b06e040"');
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildSwapJettonToTonTxParams({
        ...txArguments,
        gasAmount: new BN("1"),
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAqQAAWwGwD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJ0ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oIDuaygQEAlyWThWGAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPoF9eEAQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmhDDsZYz"',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"01"');
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildSwapJettonToTonTxParams({
        ...txArguments,
        forwardGasAmount: new BN("1"),
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEApgAAWAGqD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJ0ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oCAwEAlyWThWGAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPoF9eEAQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmhAOMvMj"',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"0b06e040"');
    });
  });

  describe("buildSwapTonToJettonTxParams", () => {
    const txArguments = {
      userWalletAddress: USER_WALLET_ADDRESS,
      proxyTonAddress: PTON_ADDRESS,
      askJettonAddress: ASK_JETTON_ADDRESS,
      offerAmount: new BN("500000000"),
      minAskAmount: new BN("200000000"),
    };
    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn(async (...args) => {
        if (
          args[0] === txArguments.askJettonAddress &&
          args[1] === "get_wallet_address"
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
            ),
          );
        }

        if (
          args[0] === txArguments.proxyTonAddress &&
          args[1] === "get_wallet_address"
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              "te6ccsEBAQEAJAAAAEOAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPwJB4oTQ==",
            ),
          );
        }

        throw new Error(`Unexpected call2: ${args}`);
      }),
    });

    it("should build expected tx params", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildSwapTonToJettonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAiAAAOgFtD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwQM0KPAwEAlyWThWGAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWoF9eEAQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmhDjXvUy"',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"2a9e08c0"');
    });

    it("should build expected tx params when referralAddress is defined", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildSwapTonToJettonTxParams({
        ...txArguments,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAqQAAOgFtD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwQM0KPAwEA2SWThWGAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWoF9eEAQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmjAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKJejif"',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"2a9e08c0"');
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildSwapTonToJettonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAiAAAOgFtD4p+pQAAAAAAADA5QdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwQM0KPAwEAlyWThWGAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWoF9eEAQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmhCp/Iax"',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"2a9e08c0"');
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildSwapTonToJettonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAiAAAOgFtD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwQM0KPAwEAlyWThWGAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWoF9eEAQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmhDjXvUy"',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"2a9e08c0"');
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildSwapTonToJettonTxParams({
        ...txArguments,
        forwardGasAmount: new BN("1"),
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAhQAANwFnD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwEBwEAlyWThWGAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWoF9eEAQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmhDuw57Y"',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"1dcd6501"');
    });
  });

  describe("createProvideLiquidityBody", () => {
    const txArguments = {
      routerWalletAddress: "EQAIBnMGyR4vXuaF3OzR80LIZ2Z_pe3z-_t_q6Blu2HKLeaY",
      minLpOut: new BN("900000000"),
    };

    it("should build expected tx body", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
      });

      const body = await contract.createProvideLiquidityBody({
        ...txArguments,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEALAAAAFP8+eWPgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFqGtJ0gFYxZ15"',
      );
    });
  });

  describe("buildProvideLiquidityJettonTxParams", () => {
    const txArguments = {
      userWalletAddress: USER_WALLET_ADDRESS,
      sendTokenAddress: OFFER_JETTON_ADDRESS,
      otherTokenAddress: ASK_JETTON_ADDRESS,
      sendAmount: new BN("500000000"),
      minLpOut: new BN("1"),
    };

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn(async (...args) => {
        if (
          args[0] === txArguments.sendTokenAddress &&
          args[1] === "get_wallet_address"
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              "te6ccsEBAQEAJAAAAEOACD+9EGh6wT/2pEbZWrfCmVbsdpQVGU9308qh2gel9QwQM97q5A==",
            ),
          );
        }

        if (
          args[0] === txArguments.otherTokenAddress &&
          args[1] === "get_wallet_address"
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
            ),
          );
        }

        throw new Error(`Unexpected call2: ${args}`);
      }),
    });

    it("should build expected tx params", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildProvideLiquidityJettonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAhAAAWwGwD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJ0ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oIHJw4AQEATfz55Y+AAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWiAyB5SNA="',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"11e1a300"');
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildProvideLiquidityJettonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAhAAAWwGwD4p+pQAAAAAAADA5QdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJ0ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oIHJw4AQEATfz55Y+AAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWiA5RF7Ts="',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"11e1a300"');
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildProvideLiquidityJettonTxParams({
        ...txArguments,
        gasAmount: new BN("1"),
        forwardGasAmount: new BN("2"),
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBB_eiDQ9YJ_7UiNsrVvhTKt2O0oKjKe76eVQ7QPS-oYPsi"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAgQAAWAGqD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJ0ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oCBQEATfz55Y+AAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWiA7KCPD4="',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"01"');
    });
  });

  describe("buildProvideLiquidityTonTxParams", () => {
    const txArguments = {
      userWalletAddress: USER_WALLET_ADDRESS,
      otherTokenAddress: OFFER_JETTON_ADDRESS,
      proxyTonAddress: PTON_ADDRESS,
      sendAmount: new BN("500000000"),
      minLpOut: new BN("1"),
    };

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn(async (...args) => {
        if (
          args[0] === txArguments.otherTokenAddress &&
          args[1] === "get_wallet_address"
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
            ),
          );
        }

        if (
          args[0] === txArguments.proxyTonAddress &&
          args[1] === "get_wallet_address"
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              "te6ccsEBAQEAJAAAAEOAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPwJB4oTQ==",
            ),
          );
        }

        throw new Error(`Unexpected call2: ${args}`);
      }),
    });

    it("should build expected tx params", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildProvideLiquidityTonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAYwAAOgFtD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwQPf0kAwEATfz55Y+AAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWiA9wURkE="',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"2d4cae00"');
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildProvideLiquidityTonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAYwAAOgFtD4p+pQAAAAAAADA5QdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwQPf0kAwEATfz55Y+AAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWiA7vDIoQ="',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"2d4cae00"');
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildProvideLiquidityTonTxParams({
        ...txArguments,
        forwardGasAmount: new BN("2"),
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAYAAANwFnD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwECwEATfz55Y+AAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWiA7iLTQM="',
      );
      expect(params.gasAmount).toMatchInlineSnapshot('"1dcd6502"');
    });
  });

  describe("getPoolAddress", () => {
    const snapshot = Cell.oneFromBoc(
      base64ToBytes(
        "te6ccsEBAQEAJAAAAEOAFL81j9ygFp1c3p71Zs3Um3CwytFAzr8LITNsQqQYk1nQDFEwYA==",
      ),
    );

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn().mockResolvedValue(snapshot),
    });

    it("should make on-chain request and return parsed response", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const poolAddress = await contract.getPoolAddress({
        token0:
          "0:87b92241aa6a57df31271460c109c54dfd989a1aea032f6107d2c65d6e8879ce",
        token1:
          "0:9f557c3e09518b8a73bccfef561896832a35b220e85df1f66834b2170db0dfcb",
      });

      expect(poolAddress).toStrictEqual(
        new Address(
          "0:a5f9ac7ee500b4eae6f4f7ab366ea4db8586568a0675f859099b621520c49ace",
        ),
      );
    });
  });

  describe("getPool", () => {
    it("should return Pool instance for existing pair", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient: createMockObj<InstanceType<typeof TonWeb.HttpProvider>>({
          call2: vi.fn(async (...args) => {
            if (
              args[0] === DEPENDENCIES.address.toString() &&
              args[1] === "get_pool_address"
            ) {
              return Cell.oneFromBoc(
                base64ToBytes(
                  "te6ccsEBAQEAJAAAAEOABTuxjU0JqtDko8O1p92eNHHiuy6flx275gE6iecPgD8Q0X0lFw==",
                ),
              );
            }

            if (
              args[0] === OFFER_JETTON_ADDRESS &&
              args[1] === "get_wallet_address"
            ) {
              return Cell.oneFromBoc(
                base64ToBytes(
                  "te6ccsEBAQEAJAAAAEOAFyFIKPdQf9SwP1GudjklnwW5klYY2/JJh4CqeuJ2a82QaHOF8w==",
                ),
              );
            }

            if (
              args[0] === ASK_JETTON_ADDRESS &&
              args[1] === "get_wallet_address"
            ) {
              return Cell.oneFromBoc(
                base64ToBytes(
                  "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
                ),
              );
            }

            throw new Error(`Unexpected call2: ${args}`);
          }),
        }),
      });

      const pool = await contract.getPool({
        token0: OFFER_JETTON_ADDRESS,
        token1: ASK_JETTON_ADDRESS,
      });

      expect(pool).toBeInstanceOf(PoolV1);
    });

    it("should return null for non-existing pair", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient: createMockObj<InstanceType<typeof TonWeb.HttpProvider>>({
          call2: vi.fn(async (...args) => {
            if (
              args[0] === DEPENDENCIES.address.toString() &&
              args[1] === "get_pool_address"
            ) {
              return Cell.oneFromBoc(
                base64ToBytes(
                  "te6ccsEBAQEAJAAAAEOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQvWZ7LQ==",
                ),
              );
            }

            if (
              args[0] === OFFER_JETTON_ADDRESS &&
              args[1] === "get_wallet_address"
            ) {
              return Cell.oneFromBoc(
                base64ToBytes(
                  "te6ccsEBAQEAJAAAAEOAFyFIKPdQf9SwP1GudjklnwW5klYY2/JJh4CqeuJ2a82QaHOF8w==",
                ),
              );
            }

            if (
              args[0] === ASK_JETTON_ADDRESS &&
              args[1] === "get_wallet_address"
            ) {
              return Cell.oneFromBoc(
                base64ToBytes(
                  "te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==",
                ),
              );
            }

            throw new Error(`Unexpected call2: ${args}`);
          }),
        }),
      });

      const pool = await contract.getPool({
        token0: OFFER_JETTON_ADDRESS,
        token1: ASK_JETTON_ADDRESS,
      });

      expect(pool).toBeNull();
    });
  });

  describe("getData", () => {
    const snapshot = [
      new BN("0"),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsEBAQEAJAAAAEOACTN3gl9yZ6lMTviWYFH4dL8SUXFIMHH8M+HgXr/0324Q2cH+VQ==",
        ),
      ),
      Cell.oneFromBoc(
        base64ToBytes("te6ccsEBAgEAFgAAFAEhAAAAAAAAAAAAAAAAAAAAACABAAAAkbB8"),
      ),
      Cell.oneFromBoc(
        base64ToBytes(
          "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",
        ),
      ),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsECDwEAAxUAAAAADQASABcAdQB6AH8A/QFVAVoB2gIUAlQCwgMFART/APSkE/S88sgLAQIBYgIOAgLMAwQAt9kGOASS+CcADoaYGAuNhKia+B+AZwfSB9IBj9ABi465D9ABj9ABgBaY+QwQgHxT9S3UqYmiz4BPAQwQgLxqKM3UsYoiIB+AVwGsEILK+D3l1JrPgF8C+CQgf5eEAgEgBQ0CASAGCAH1UD0z/6APpAcCKAVQH6RDBYuvL07UTQ+gD6QPpA1DBRNqFSKscF8uLBKML/8uLCVDRCcFQgE1QUA8hQBPoCWM8WAc8WzMkiyMsBEvQA9ADLAMkg+QBwdMjLAsoHy//J0AT6QPQEMfoAINdJwgDy4sR3gBjIywVQCM8WcIBwCs+gIXy2sTzIIQF41FGcjLHxnLP1AH+gIizxZQBs8WJfoCUAPPFslQBcwjkXKRceJQCKgToIIJycOAoBS88uLFBMmAQPsAECPIUAT6AljPFgHPFszJ7VQCASAJDAL3O1E0PoA+kD6QNQwCNM/+gBRUaAF+kD6QFNbxwVUc21wVCATVBQDyFAE+gJYzxYBzxbMySLIywES9AD0AMsAyfkAcHTIywLKB8v/ydBQDccFHLHy4sMK+gBRqKGCCJiWgGa2CKGCCJiWgKAYoSeXEEkQODdfBOMNJdcLAYAoLAHBSeaAYoYIQc2LQnMjLH1Iwyz9Y+gJQB88WUAfPFslxgBjIywUkzxZQBvoCFctqFMzJcfsAECQQIwB8wwAjwgCwjiGCENUydttwgBDIywVQCM8WUAT6AhbLahLLHxLLP8ly+wCTNWwh4gPIUAT6AljPFgHPFszJ7VQA1ztRND6APpA+kDUMAfTP/oA+kAwUVGhUknHBfLiwSfC//LiwgWCCTEtAKAWvPLiw4IQe92X3sjLHxXLP1AD+gIizxYBzxbJcYAYyMsFJM8WcPoCy2rMyYBA+wBAE8hQBPoCWM8WAc8WzMntVIACB1AEGuQ9qJofQB9IH0gahgCaY+QwQgLxqKM3QFBCD3uy+9dCVj5cWLpn5j9ABgJ0CgR5CgCfQEsZ4sA54tmZPaqQAG6D2BdqJofQB9IH0gahhq3vDTA==",
        ),
      ),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsECDAEAAo0AAAAADQASAGkA5wFGAckB4QIBAhcCUQJpART/APSkE/S88sgLAQIBYgILA6TQIMcAkl8E4AHQ0wPtRND6QAH4YfpAAfhi+gAB+GP6ADD4ZAFxsJJfBOD6QDBwIYBVAfpEMFi68vQB0x/TP/hCUkDHBeMC+EFSQMcF4wI0NEMTAwQJAfYzVSFsIQKCED6+VDG6juUB+gD6APoAMPhDUAOg+GP4RAGg+GT4Q4ED6Lz4RIED6LywUhCwjqeCEFbf64rIyx8Syz/4Q/oC+ET6AvhBzxYB+gL4QgHJ2zxw+GNw+GSRW+LI+EHPFvhCzxb4Q/oC+ET6AsntVJVbhA/y8OIKArYzVSExI4IQC/P0R7qOyxAjXwP4Q8IA+ETCALHy4FCCEIlEakLIyx/LP/hD+gL4RPoC+EHPFnD4QgLJEoBA2zxw+GNw+GTI+EHPFvhCzxb4Q/oC+ET6AsntVOMOBgUC/iOCEEz4KAO6juoxbBL6APoA+gAwIoED6LwigQPovLBSELDy4FH4QyOh+GP4RCKh+GT4Q8L/+ETC/7Dy4FCCEFbf64rIyx8Uyz9Y+gIB+gL4Qc8WAfoCcPhCAskSgEDbPMj4Qc8W+ELPFvhD+gL4RPoCye1U4DAxAYIQQqD7Q7oGBwAscYAYyMsFUATPFlAE+gISy2rMyQH7AAE6jpUgggiYloC88uBTggiYloCh+EFw2zzgMIQP8vAIAChwgBjIywVQA88WUAP6AstqyQH7AAFuMHB0+wICghAdQ5rguo6fghAdQ5rgyMsfyz/4Qc8W+ELPFvhD+gL4RPoCyds8f5JbcOLchA/y8AoALHGAGMjLBVADzxZw+gISy2rMyYMG+wAAQ6G6bdqJofSAA/DD9IAD8MX0AAPwx/QAYfDJ8IPwhfCH8InFhJmX",
        ),
      ),
    ];

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn().mockResolvedValue(snapshot),
    });

    it("should make on-chain request and return parsed response", async () => {
      const contract = new RouterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const data = await contract.getData();

      expect(data.isLocked).toBe(false);
      expect(data.adminAddress).toStrictEqual(
        new Address(
          "0:499bbc12fb933d4a6277c4b3028fc3a5f8928b8a41838fe19f0f02f5ffa6fb70",
        ),
      );
      expect(
        bytesToBase64(await data.tempUpgrade.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAgEAFgAAFAEhAAAAAAAAAAAAAAAAAAAAACABAAAAkbB8"',
      );
      expect(bytesToBase64(await data.poolCode.toBoc())).toMatchInlineSnapshot(
        '"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"',
      );
      expect(
        bytesToBase64(await data.jettonLpWalletCode.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsECDwEAAxUAAAAADQASABcAdQB6AH8A/QFVAVoB2gIUAlQCwgMFART/APSkE/S88sgLAQIBYgIOAgLMAwQAt9kGOASS+CcADoaYGAuNhKia+B+AZwfSB9IBj9ABi465D9ABj9ABgBaY+QwQgHxT9S3UqYmiz4BPAQwQgLxqKM3UsYoiIB+AVwGsEILK+D3l1JrPgF8C+CQgf5eEAgEgBQ0CASAGCAH1UD0z/6APpAcCKAVQH6RDBYuvL07UTQ+gD6QPpA1DBRNqFSKscF8uLBKML/8uLCVDRCcFQgE1QUA8hQBPoCWM8WAc8WzMkiyMsBEvQA9ADLAMkg+QBwdMjLAsoHy//J0AT6QPQEMfoAINdJwgDy4sR3gBjIywVQCM8WcIBwCs+gIXy2sTzIIQF41FGcjLHxnLP1AH+gIizxZQBs8WJfoCUAPPFslQBcwjkXKRceJQCKgToIIJycOAoBS88uLFBMmAQPsAECPIUAT6AljPFgHPFszJ7VQCASAJDAL3O1E0PoA+kD6QNQwCNM/+gBRUaAF+kD6QFNbxwVUc21wVCATVBQDyFAE+gJYzxYBzxbMySLIywES9AD0AMsAyfkAcHTIywLKB8v/ydBQDccFHLHy4sMK+gBRqKGCCJiWgGa2CKGCCJiWgKAYoSeXEEkQODdfBOMNJdcLAYAoLAHBSeaAYoYIQc2LQnMjLH1Iwyz9Y+gJQB88WUAfPFslxgBjIywUkzxZQBvoCFctqFMzJcfsAECQQIwB8wwAjwgCwjiGCENUydttwgBDIywVQCM8WUAT6AhbLahLLHxLLP8ly+wCTNWwh4gPIUAT6AljPFgHPFszJ7VQA1ztRND6APpA+kDUMAfTP/oA+kAwUVGhUknHBfLiwSfC//LiwgWCCTEtAKAWvPLiw4IQe92X3sjLHxXLP1AD+gIizxYBzxbJcYAYyMsFJM8WcPoCy2rMyYBA+wBAE8hQBPoCWM8WAc8WzMntVIACB1AEGuQ9qJofQB9IH0gahgCaY+QwQgLxqKM3QFBCD3uy+9dCVj5cWLpn5j9ABgJ0CgR5CgCfQEsZ4sA54tmZPaqQAG6D2BdqJofQB9IH0gahhq3vDTA=="',
      );
      expect(
        bytesToBase64(await data.lpAccountCode.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsECDAEAAo0AAAAADQASAGkA5wFGAckB4QIBAhcCUQJpART/APSkE/S88sgLAQIBYgILA6TQIMcAkl8E4AHQ0wPtRND6QAH4YfpAAfhi+gAB+GP6ADD4ZAFxsJJfBOD6QDBwIYBVAfpEMFi68vQB0x/TP/hCUkDHBeMC+EFSQMcF4wI0NEMTAwQJAfYzVSFsIQKCED6+VDG6juUB+gD6APoAMPhDUAOg+GP4RAGg+GT4Q4ED6Lz4RIED6LywUhCwjqeCEFbf64rIyx8Syz/4Q/oC+ET6AvhBzxYB+gL4QgHJ2zxw+GNw+GSRW+LI+EHPFvhCzxb4Q/oC+ET6AsntVJVbhA/y8OIKArYzVSExI4IQC/P0R7qOyxAjXwP4Q8IA+ETCALHy4FCCEIlEakLIyx/LP/hD+gL4RPoC+EHPFnD4QgLJEoBA2zxw+GNw+GTI+EHPFvhCzxb4Q/oC+ET6AsntVOMOBgUC/iOCEEz4KAO6juoxbBL6APoA+gAwIoED6LwigQPovLBSELDy4FH4QyOh+GP4RCKh+GT4Q8L/+ETC/7Dy4FCCEFbf64rIyx8Uyz9Y+gIB+gL4Qc8WAfoCcPhCAskSgEDbPMj4Qc8W+ELPFvhD+gL4RPoCye1U4DAxAYIQQqD7Q7oGBwAscYAYyMsFUATPFlAE+gISy2rMyQH7AAE6jpUgggiYloC88uBTggiYloCh+EFw2zzgMIQP8vAIAChwgBjIywVQA88WUAP6AstqyQH7AAFuMHB0+wICghAdQ5rguo6fghAdQ5rgyMsfyz/4Qc8W+ELPFvhD+gL4RPoCyds8f5JbcOLchA/y8AoALHGAGMjLBVADzxZw+gISy2rMyYMG+wAAQ6G6bdqJofSAA/DD9IAD8MX0AAPwx/QAYfDJ8IPwhfCH8InFhJmX"',
      );
    });
  });
});
