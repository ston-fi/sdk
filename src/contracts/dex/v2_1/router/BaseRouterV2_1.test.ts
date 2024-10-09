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
import { pTON } from "@/contracts/pTON";

import { DEX_VERSION } from "../../constants";
import * as Errors from "../../errors";

import { BaseRouterV2_1 } from "./BaseRouterV2_1";
import { BasePoolV2_1 } from "../pool/BasePoolV2_1";
import { VaultV2_1 } from "../vault/VaultV2_1";

const USER_WALLET_ADDRESS = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";
const ROUTER_ADDRESS = "kQALh-JBBIKK7gr0o4AVf9JZnEsFndqO0qTCyT-D-yBsWk0v";
const OFFER_JETTON_ADDRESS = "kQDLvsZol3juZyOAVG8tWsJntOxeEZWEaWCbbSjYakQpuYN5"; // TestRED
const ASK_JETTON_ADDRESS = "kQB_TOJSB7q3-Jm1O8s0jKFtqLElZDPjATs5uJGsujcjznq3"; // TestBLUE

const PTON_CONTRACT = pTON.v2_1.create(
  "kQACS30DNoUQ7NfApPvzh7eBmSZ9L4ygJ-lkNWtba8TQT-Px",
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

    it("should throw error if address of the v1 contract is passed", () => {
      expect(() => {
        return BaseRouterV2_1.create(
          "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt",
        );
      }).toThrowError();
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
        '"te6cckEBAwEA+wABsA+KfqUAAAAAAAAAAEHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAeFmZN4qgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEEDtWOk="',
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
        '"te6cckECAwEAARwAAbAPin6lAAAAAAAAAABB3NZQCAAXD8SCCQUV3BXpRwAq/6SzOJYLO7UdpUmFkn8H9kDYtQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmggcnDgBAQHhZmTeKoABAM5g2SPF69zQu52aPmhZDOzP9L2+f39v9XQMt2w5RbAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkACAJVAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABUABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ojKQry0"',
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
        '"te6cckEBAwEA+wABsA+KfqUAAAAAAAAwOUHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAeFmZN4qgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEFJ0r6o="',
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
        '"te6cckEBAwEA+wABsA+KfqUAAAAAAAAAAEHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAeFmZN4qgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEEDtWOk="',
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
        '"te6cckEBAwEA+AABqg+KfqUAAAAAAAAAAEHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaAgMBAeFmZN4qgAEAzmDZI8Xr3NC7nZo+aFkM7M/0vb5/f2/1dAy3bDlFsABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEFP7T9o="',
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
        '"te6cckEBBAEA/wACsA+KfqUAAAAAAAAAAEHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKBycOAEBAgABwAHhZmTeKoABAM5g2SPF69zQu52aPmhZDOzP9L2+f39v9XQMt2w5RbAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkADAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRAP2Xg/"',
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
          "te6cckEBAQEAJAAAQ4AF4Mp/4pXSSCCNslBdh3inzDl8zuNdbtFOP+OLSd019nDKe9Kt",
        );
      }

      if (
        address ===
          Address.normalize(txArguments.proxyTon.address.toString()) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6cckEBAQEAJAAAQ4ALZMc7UIJgzZihOEIC5c/gMUUDgy5hMKQWkvYYMLrAANDUMxE8",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it(
      "should build expected tx params",
      async () => {
        const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

        const params = await contract.getSwapJettonToTonTxParams({
          ...txArguments,
        });

        expect(params.to.toString()).toMatchInlineSnapshot(
          '"EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X"',
        );
        expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
          '"te6cckEBAwEA+wABsA+KfqUAAAAAAAAAAEHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAeFmZN4qgAtkxztQgmDNmKE4QgLlz+AxRQODLmEwpBaS9hgwusAA0ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEGHurak="',
        );
        expect(params.value).toMatchInlineSnapshot("300000000n");
      },
      {
        timeout: 130 * 1000,
      },
    );

    it("should build expected tx params when referralAddress is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapJettonToTonTxParams({
        ...txArguments,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckECAwEAARwAAbAPin6lAAAAAAAAAABB3NZQCAAXD8SCCQUV3BXpRwAq/6SzOJYLO7UdpUmFkn8H9kDYtQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmggcnDgBAQHhZmTeKoALZMc7UIJgzZihOEIC5c/gMUUDgy5hMKQWkvYYMLrAANAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkACAJVAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABUABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogE0oBQ"',
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
        '"EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA+wABsA+KfqUAAAAAAAAwOUHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAeFmZN4qgAtkxztQgmDNmKE4QgLlz+AxRQODLmEwpBaS9hgwusAA0ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEHN3Wuo="',
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
        '"EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA+wABsA+KfqUAAAAAAAAAAEHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAeFmZN4qgAtkxztQgmDNmKE4QgLlz+AxRQODLmEwpBaS9hgwusAA0ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEGHurak="',
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
        '"EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA+AABqg+KfqUAAAAAAAAAAEHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaAgMBAeFmZN4qgAtkxztQgmDNmKE4QgLlz+AxRQODLmEwpBaS9hgwusAA0ABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIAU0C+vCAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAFEHL4upo="',
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
        '"EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBBAEA/wACsA+KfqUAAAAAAAAAAEHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKBycOAEBAgABwAHhZmTeKoALZMc7UIJgzZihOEIC5c/gMUUDgy5hMKQWkvYYMLrAANAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkADAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRAu2o1/"',
      );
      expect(params.value).toMatchInlineSnapshot("300000000n");
    });

    it("should throw UnmatchedPtonVersion error when pTON version does not match", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      await expect(
        contract.getSwapJettonToTonTxParams({
          ...txArguments,
          proxyTon: pTON.v1.create(
            PTON_CONTRACT.address,
          ) as typeof PTON_CONTRACT,
        }),
      ).rejects.toThrowError(
        new Errors.UnmatchedPtonVersion({
          expected: BaseRouterV2_1.version,
          received: pTON.v1.version,
        }),
      );
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
          "te6cckEBAQEAJAAAQ4AOHVtw9k5i6efu1Ofm2mbqbMyLChv0FZFYxaypjToz1nAgGr6p",
        );
      }

      if (
        address ===
          Address.normalize(txArguments.proxyTon.address.toString()) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6cckEBAQEAJAAAQ4ALZMc7UIJgzZihOEIC5c/gMUUDgy5hMKQWkvYYMLrAANDUMxE8",
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
        '"EQBbJjnahBMGbMUJwhAXLn8BiigcGXMJhSC0l7DBhdYABqox"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA1QABZAHzg10AAAAAAAAAAEHc1lAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAQHhZmTeKoAOHVtw9k5i6efu1Ofm2mbqbMyLChv0FZFYxaypjToz1nAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkACAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRAK+HJz"',
      );
      expect(params.value).toMatchInlineSnapshot("810000000n");
    });

    it("should build expected tx params when referralAddress is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapTonToJettonTxParams({
        ...txArguments,
        referralAddress: USER_WALLET_ADDRESS,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBbJjnahBMGbMUJwhAXLn8BiigcGXMJhSC0l7DBhdYABqox"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA9gABZAHzg10AAAAAAAAAAEHc1lAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAQHhZmTeKoAOHVtw9k5i6efu1Ofm2mbqbMyLChv0FZFYxaypjToz1nAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkACAJVAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABUABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ohVpNSt"',
      );
      expect(params.value).toMatchInlineSnapshot("810000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapTonToJettonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBbJjnahBMGbMUJwhAXLn8BiigcGXMJhSC0l7DBhdYABqox"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA1QABZAHzg10AAAAAAAAwOUHc1lAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAQHhZmTeKoAOHVtw9k5i6efu1Ofm2mbqbMyLChv0FZFYxaypjToz1nAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkACAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRC9p6CP"',
      );
      expect(params.value).toMatchInlineSnapshot("810000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapTonToJettonTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBbJjnahBMGbMUJwhAXLn8BiigcGXMJhSC0l7DBhdYABqox"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA1QABZAHzg10AAAAAAAAAAEHc1lAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAQHhZmTeKoAOHVtw9k5i6efu1Ofm2mbqbMyLChv0FZFYxaypjToz1nAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkACAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRAK+HJz"',
      );
      expect(params.value).toMatchInlineSnapshot("810000000n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSwapTonToJettonTxParams({
        ...txArguments,
        forwardGasAmount: "1",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBbJjnahBMGbMUJwhAXLn8BiigcGXMJhSC0l7DBhdYABqox"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA1QABZAHzg10AAAAAAAAAAEHc1lAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAQHhZmTeKoAOHVtw9k5i6efu1Ofm2mbqbMyLChv0FZFYxaypjToz1nAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkACAFNAvrwgCAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AAABRAK+HJz"',
      );
      expect(params.value).toMatchInlineSnapshot("510000001n");
    });

    it("should throw UnmatchedPtonVersion error when pTON version does not match", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      await expect(
        contract.getSwapTonToJettonTxParams({
          ...txArguments,
          proxyTon: pTON.v1.create(
            PTON_CONTRACT.address,
          ) as typeof PTON_CONTRACT,
        }),
      ).rejects.toThrowError(
        new Errors.UnmatchedPtonVersion({
          expected: BaseRouterV2_1.version,
          received: pTON.v1.version,
        }),
      );
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
          "te6cckEBAQEAJAAAQ4AF4Mp/4pXSSCCNslBdh3inzDl8zuNdbtFOP+OLSd019nDKe9Kt",
        );
      }

      if (
        address === Address.normalize(txArguments.otherTokenAddress) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6cckEBAQEAJAAAQ4AOHVtw9k5i6efu1Ofm2mbqbMyLChv0FZFYxaypjToz1nAgGr6p",
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
        '"EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA9QABsA+KfqUAAAAAAAAAAEHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBwDoYEBAeE3wJbfgA4dW3D2TmLp5+7U5+baZupszIsKG/QVkVjFrKmNOjPWcABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRBCOsfc0="',
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
        '"EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA9QABsA+KfqUAAAAAAAAwOUHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBwDoYEBAeE3wJbfgA4dW3D2TmLp5+7U5+baZupszIsKG/QVkVjFrKmNOjPWcABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRBHqHBuo="',
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
        '"EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA9QABsA+KfqUAAAAAAAAAAEHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBwDoYEBAeE3wJbfgA4dW3D2TmLp5+7U5+baZupszIsKG/QVkVjFrKmNOjPWcABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRBCOsfc0="',
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
        '"EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA8gABqg+KfqUAAAAAAAAAAEHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaAgMBAeE3wJbfgA4dW3D2TmLp5+7U5+baZupszIsKG/QVkVjFrKmNOjPWcABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRBO5K/Y0="',
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
        '"EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBBAEA+QACsA+KfqUAAAAAAAAAAEHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKBwDoYEBAgABwAHhN8CW34AOHVtw9k5i6efu1Ofm2mbqbMyLChv0FZFYxaypjToz1nAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkADAEcQGAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QT+8kEc"',
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
          "te6cckEBAQEAJAAAQ4AbODBzUaSK5j0GzCBQi97jKeks860gYcTemIQLL7ZKxZD8mj8B",
        );
      }

      if (
        address ===
          Address.normalize(txArguments.proxyTon.address.toString()) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6cckEBAQEAJAAAQ4ALZMc7UIJgzZihOEIC5c/gMUUDgy5hMKQWkvYYMLrAANDUMxE8",
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
        '"EQBbJjnahBMGbMUJwhAXLn8BiigcGXMJhSC0l7DBhdYABqox"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEAzwABZAHzg10AAAAAAAAAAEHc1lAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAQHhN8CW34AbODBzUaSK5j0GzCBQi97jKeks860gYcTemIQLL7ZKxZAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkACAEcQGAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QRdMlyp"',
      );
      expect(params.value).toMatchInlineSnapshot("810000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getProvideLiquidityTonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBbJjnahBMGbMUJwhAXLn8BiigcGXMJhSC0l7DBhdYABqox"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEAzwABZAHzg10AAAAAAAAwOUHc1lAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAQHhN8CW34AbODBzUaSK5j0GzCBQi97jKeks860gYcTemIQLL7ZKxZAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkACAEcQGAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QS2prCg"',
      );
      expect(params.value).toMatchInlineSnapshot("810000000n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getProvideLiquidityTonTxParams({
        ...txArguments,
        forwardGasAmount: "2",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBbJjnahBMGbMUJwhAXLn8BiigcGXMJhSC0l7DBhdYABqox"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEAzwABZAHzg10AAAAAAAAAAEHc1lAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAQHhN8CW34AbODBzUaSK5j0GzCBQi97jKeks860gYcTemIQLL7ZKxZAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkACAEcQGAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QRdMlyp"',
      );
      expect(params.value).toMatchInlineSnapshot("510000002n");
    });

    it("should throw UnmatchedPtonVersion error when pTON version does not match", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      await expect(
        contract.getProvideLiquidityTonTxParams({
          ...txArguments,
          proxyTon: pTON.v1.create(
            PTON_CONTRACT.address,
          ) as typeof PTON_CONTRACT,
        }),
      ).rejects.toThrowError(
        new Errors.UnmatchedPtonVersion({
          expected: BaseRouterV2_1.version,
          received: pTON.v1.version,
        }),
      );
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
          "te6cckEBAQEAJAAAQ4AF4Mp/4pXSSCCNslBdh3inzDl8zuNdbtFOP+OLSd019nDKe9Kt",
        );
      }

      if (
        address === Address.normalize(txArguments.otherTokenAddress) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6cckEBAQEAJAAAQ4AOHVtw9k5i6efu1Ofm2mbqbMyLChv0FZFYxaypjToz1nAgGr6p",
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
        '"EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA9QABsA+KfqUAAAAAAAAAAEHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCF9eEAEBAeE3wJbfgA4dW3D2TmLp5+7U5+baZupszIsKG/QVkVjFrKmNOjPWcABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQBMl7/Jw="',
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
        '"EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA9QABsA+KfqUAAAAAAAAwOUHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCF9eEAEBAeE3wJbfgA4dW3D2TmLp5+7U5+baZupszIsKG/QVkVjFrKmNOjPWcABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQBJBQh7s="',
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
        '"EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA9QABsA+KfqUAAAAAAAAAAEHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCF9eEAEBAeE3wJbfgA4dW3D2TmLp5+7U5+baZupszIsKG/QVkVjFrKmNOjPWcABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQBMl7/Jw="',
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
        '"EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEA8gABqg+KfqUAAAAAAAAAAEHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaAgMBAeE3wJbfgA4dW3D2TmLp5+7U5+baZupszIsKG/QVkVjFrKmNOjPWcABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5ogAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNAAAAAAAAAHCQAIARxAYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQBJnSX54="',
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
        '"EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBBAEA+QACsA+KfqUAAAAAAAAAAEHc1lAIABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKF9eEAEBAgABwAHhN8CW34AOHVtw9k5i6efu1Ofm2mbqbMyLChv0FZFYxaypjToz1nAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkADAEcQGAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0ASDFuyE"',
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
          "te6cckEBAQEAJAAAQ4AbODBzUaSK5j0GzCBQi97jKeks860gYcTemIQLL7ZKxZD8mj8B",
        );
      }

      if (
        address ===
          Address.normalize(txArguments.proxyTon.address.toString()) &&
        method === "get_wallet_address"
      ) {
        return createProviderSnapshot().cell(
          "te6cckEBAQEAJAAAQ4ALZMc7UIJgzZihOEIC5c/gMUUDgy5hMKQWkvYYMLrAANDUMxE8",
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
        '"EQBbJjnahBMGbMUJwhAXLn8BiigcGXMJhSC0l7DBhdYABqox"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEAzwABZAHzg10AAAAAAAAAAEHc1lAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAQHhN8CW34AbODBzUaSK5j0GzCBQi97jKeks860gYcTemIQLL7ZKxZAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkACAEcQGAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AQqqv66"',
      );
      expect(params.value).toMatchInlineSnapshot("1310000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSingleSideProvideLiquidityTonTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBbJjnahBMGbMUJwhAXLn8BiigcGXMJhSC0l7DBhdYABqox"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEAzwABZAHzg10AAAAAAAAwOUHc1lAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAQHhN8CW34AbODBzUaSK5j0GzCBQi97jKeks860gYcTemIQLL7ZKxZAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkACAEcQGAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0ATBPhKz"',
      );
      expect(params.value).toMatchInlineSnapshot("1310000000n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const params = await contract.getSingleSideProvideLiquidityTonTxParams({
        ...txArguments,
        forwardGasAmount: "2",
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQBbJjnahBMGbMUJwhAXLn8BiigcGXMJhSC0l7DBhdYABqox"',
      );
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAwEAzwABZAHzg10AAAAAAAAAAEHc1lAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAQHhN8CW34AbODBzUaSK5j0GzCBQi97jKeks860gYcTemIQLL7ZKxZAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzQAAAAAAAABwkACAEcQGAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0AQqqv66"',
      );
      expect(params.value).toMatchInlineSnapshot("510000002n");
    });

    it("should throw UnmatchedPtonVersion error when pTON version does not match", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      await expect(
        contract.getSingleSideProvideLiquidityTonTxParams({
          ...txArguments,
          proxyTon: pTON.v1.create(
            PTON_CONTRACT.address,
          ) as typeof PTON_CONTRACT,
        }),
      ).rejects.toThrowError(
        new Errors.UnmatchedPtonVersion({
          expected: BaseRouterV2_1.version,
          received: pTON.v1.version,
        }),
      );
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
      "te6cckEBAQEAJAAAQ4AWzVFZdy/2+hV2CZSckIUToPmkGBYiuPkjo3alPyoWPRBqnub+",
    );
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const poolAddress = await contract.getPoolAddress({
        token0: "EQBqMJD7AXc2Wtt9NHg4kzMbJi2JwS_Hk6kCtLsw2c2CPyVU", // Wallet of ASK_JETTON_ADDRESS with USER_WALLET_ADDRESS owner
        token1: "EQAvBlP_FK6SQQRtkoLsO8U-Ycvmdxrrdopx_xxaTumvs26X", // Wallet of OFFER_JETTON_ADDRESS with USER_WALLET_ADDRESS owner
      });

      expect(poolAddress).toMatchInlineSnapshot(
        '"EQC2aorLuX-30KuwTKTkhCidB80gwLEVx8kdG7Up-VCx6Lat"',
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
            "te6cckEBAQEAJAAAQ4AbKt2Bb3pHS8bNc829uKGQg9yvKLmEqSKo9NUV1pdmHRDqCLOi",
          );
        }

        if (
          address === Address.normalize(OFFER_JETTON_ADDRESS) &&
          method === "get_wallet_address"
        ) {
          return createProviderSnapshot().cell(
            "te6cckEBAQEAJAAAQ4AbODBzUaSK5j0GzCBQi97jKeks860gYcTemIQLL7ZKxZD8mj8B",
          );
        }

        if (
          address === Address.normalize(ASK_JETTON_ADDRESS) &&
          method === "get_wallet_address"
        ) {
          return createProviderSnapshot().cell(
            "te6cckEBAQEAJAAAQ4AOHVtw9k5i6efu1Ofm2mbqbMyLChv0FZFYxaypjToz1nAgGr6p",
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
      "te6cckEBAQEAJAAAQ4AOo5jH39wSoY/BkiULNb/FrVsMfn6Jt7ovQUNwsvardvCdf3nu",
    );
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const vaultAddress = await contract.getVaultAddress({
        user: USER_WALLET_ADDRESS,
        tokenWallet: OFFER_JETTON_ADDRESS,
      });

      expect(vaultAddress).toMatchInlineSnapshot(
        '"EQB1HMY-_uCVDH4MkShZrf4tathj8_RNvdF6ChuFl7Vbt1tu"',
      );
    });
  });

  describe("getVault", () => {
    it("should return Vault instance for user and tokenMinter", async () => {
      const snapshot = createProviderSnapshot().cell(
        "te6cckEBAQEAJAAAQ4APnbYFk/sHIc85nyovU2iRke85JwO8rxYn6ilYMKhtfzAcWMdK",
      );
      const provider = createMockProviderFromSnapshot(snapshot);

      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const vault = await contract.getVault({
        user: USER_WALLET_ADDRESS,
        tokenMinter: OFFER_JETTON_ADDRESS,
      });

      expect(vault).toBeInstanceOf(VaultV2_1);
    });
  });

  describe("getRouterVersion", () => {
    const snapshot = createProviderSnapshot()
      .number("2")
      .number("1")
      .cell("te6cckEBAQEACQAADmJldGEzLjKDhOms");
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const data = await contract.getRouterVersion();

      expect(data.major).toStrictEqual(2);
      expect(data.minor).toStrictEqual(1);
      expect(data.development).toStrictEqual("beta3.2");
    });
  });

  describe("getRouterData", () => {
    const snapshot = createProviderSnapshot()
      .number("101")
      .cell("te6cckEBAQEAEgAAIGNvbnN0YW50X3Byb2R1Y3Svg+BE")
      .number("0")
      .cell(
        "te6cckEBAQEAJAAAQ4AVNOalswyRkG4pCMopecKdFTbQWmMc0eZ0+lHY/BngFzCuo2Mw",
      )
      .cell("te6cckEBAgEAFgABIQAAAAAAAAAAAAAAAAAAAAAgAQAAnpyZMQ==")
      .cell(
        "te6cckEBAQEAIwAIQgJjHPmLuz7lQNrMSCVpddjiwwgMY085AFzNjhWTyrADX26YlPU=",
      )
      .cell(
        "te6cckEBAQEAIwAIQgIFDtIQf3MKRJPPzdvGe9uDhU8ZBbNIYjZTDVpQch0YFyKWcwM=",
      )
      .cell(
        "te6cckEBAQEAIwAIQgJ8HzqgEmVFMFiIc3ijWM83MUhWNQQAgEwWm2SMP9++TPVuB68=",
      )
      .cell(
        "te6cckEBAQEAIwAIQgIbYxVPEKzZg0WmWJCZcJTphWqivk8eNwYIZVGfpCAy/S2f2kg=",
      );
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(BaseRouterV2_1.create(ROUTER_ADDRESS));

      const data = await contract.getRouterData();

      expect(data.routerId).toMatchInlineSnapshot("101");
      expect(data.dexType).toMatchInlineSnapshot('"constant_product"');
      expect(data.isLocked).toBe(false);
      expect(data.adminAddress).toMatchInlineSnapshot(
        '"EQCppzUtmGSMg3FIRlFLzhToqbaC0xjmjzOn0o7H4M8Aua1t"',
      );
      expect(data.tempUpgrade.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAFgABIQAAAAAAAAAAAAAAAAAAAAAgAQAAnpyZMQ=="',
      );
      expect(data.poolCode.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAIwAIQgJjHPmLuz7lQNrMSCVpddjiwwgMY085AFzNjhWTyrADX26YlPU="',
      );
      expect(
        data.jettonLpWalletCode.toBoc().toString("base64"),
      ).toMatchInlineSnapshot(
        '"te6cckEBAQEAIwAIQgIFDtIQf3MKRJPPzdvGe9uDhU8ZBbNIYjZTDVpQch0YFyKWcwM="',
      );
      expect(
        data.lpAccountCode.toBoc().toString("base64"),
      ).toMatchInlineSnapshot(
        '"te6cckEBAQEAIwAIQgJ8HzqgEmVFMFiIc3ijWM83MUhWNQQAgEwWm2SMP9++TPVuB68="',
      );
      expect(data.vaultCode.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAIwAIQgIbYxVPEKzZg0WmWJCZcJTphWqivk8eNwYIZVGfpCAy/S2f2kg="',
      );
    });
  });
});
