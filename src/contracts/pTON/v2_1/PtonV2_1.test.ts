import { beforeAll, describe, expect, it, vi } from "vitest";
import { beginCell, toNano, type Sender } from "@ton/ton";

import {
  createMockObj,
  createMockProvider,
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "@/test-utils";

import { pTON_VERSION } from "../constants";

import { PtonV2_1 } from "./PtonV2_1";

const PROXY_TON_ADDRESS = "EQACS30DNoUQ7NfApPvzh7eBmSZ9L4ygJ-lkNWtba8TQT1h7";
const USER_WALLET_ADDRESS = "EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i";
const ROUTER_WALLER_ADDRESS =
  "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt";

describe("PtonV2_1", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(PtonV2_1.version).toBe(pTON_VERSION.v2_1);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(PtonV2_1.gasConstants.tonTransfer).toMatchInlineSnapshot(
        "10000000n",
      );
      expect(PtonV2_1.gasConstants.deployWallet).toMatchInlineSnapshot(
        "100000000n",
      );
    });
  });

  describe("create", () => {
    it("should create an instance of PtonV2_1", () => {
      const contract = PtonV2_1.create(PtonV2_1.address);

      expect(contract).toBeInstanceOf(PtonV2_1);
    });
  });

  describe("constructor", () => {
    it("should create an instance of PtonV2_1", () => {
      const contract = PtonV2_1.create(PtonV2_1.address);

      expect(contract).toBeInstanceOf(PtonV2_1);
    });

    it("should create an instance of PtonV2_1 with given address", () => {
      const contract = new PtonV2_1(USER_WALLET_ADDRESS); // just an address, not a real pTON v2 contract

      expect(contract.address.toString()).toEqual(USER_WALLET_ADDRESS);
    });

    it("should create an instance of PtonV2_1 with default gasConstants", () => {
      const contract = PtonV2_1.create(PtonV2_1.address);

      expect(contract.gasConstants).toEqual(PtonV2_1.gasConstants);
    });

    it("should create an instance of PtonV2_1 with given gasConstants", () => {
      const gasConstants: Partial<PtonV2_1["gasConstants"]> = {
        deployWallet: BigInt("1"),
      };

      const contract = new PtonV2_1(PtonV2_1.address, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });

    it("should create an instance of PtonV1 with correct version", () => {
      const contract = PtonV2_1.create(PtonV2_1.address);

      expect(contract.version).toEqual(PtonV2_1.version);
    });
  });

  describe("getTonTransferTxParams", () => {
    const txArgs = {
      tonAmount: toNano(1),
      destinationAddress: "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt",
      refundAddress: USER_WALLET_ADDRESS,
    };

    const snapshot = createProviderSnapshot().cell(
      "te6cckEBAQEAJAAAQ4AH4x7SfeNjQkXUl+0C2AHX4qQvviK8XWg/QsVZ09pdM5C969XU",
    );

    const provider = createMockProviderFromSnapshot((address, method) => {
      if (address === PROXY_TON_ADDRESS && method === "get_wallet_address")
        return snapshot;

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(new PtonV2_1(PROXY_TON_ADDRESS));

      const txParams = await contract.getTonTransferTxParams(txArgs);

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQA_GPaT7xsaEi6kv2gWwA6_FSF98RXi60H6FirOntLpnBz7"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEANAAAYwHzg10AAAAAAAAAAEO5rKAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRRFUPGw=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1010000000n");
    });

    it("should build expected tx params when forwardPayload is defined", async () => {
      const contract = provider.open(new PtonV2_1(PROXY_TON_ADDRESS));

      const txParams = await contract.getTonTransferTxParams({
        ...txArgs,
        forwardPayload: beginCell().endCell(),
        forwardTonAmount: toNano(0.1),
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQA_GPaT7xsaEi6kv2gWwA6_FSF98RXi60H6FirOntLpnBz7"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEANwABZAHzg10AAAAAAAAAAEO5rKAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAQAAEQ6zpA=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1110000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(new PtonV2_1(PROXY_TON_ADDRESS));

      const txParams = await contract.getTonTransferTxParams({
        ...txArgs,
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQA_GPaT7xsaEi6kv2gWwA6_FSF98RXi60H6FirOntLpnBz7"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEANAAAYwHzg10AAAAAAAAwOUO5rKAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzR24kJEw=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1010000000n");
    });
  });

  describe("sendTonTransfer", () => {
    it("should call getTonTransferTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<PtonV2_1["sendTonTransfer"]>[2];

      const contract = new PtonV2_1(PROXY_TON_ADDRESS);

      const getTonTransferTxParams = vi.spyOn(
        contract,
        "getTonTransferTxParams",
      );

      const txParams = {} as Awaited<
        ReturnType<typeof contract.getTonTransferTxParams>
      >;

      getTonTransferTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendTonTransfer(provider, sender, txArgs);

      expect(getTonTransferTxParams).toHaveBeenCalledWith(provider, txArgs);
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("createDeployWalletBody", () => {
    const txArgs = {
      ownerAddress: ROUTER_WALLER_ADDRESS,
      excessAddress: USER_WALLET_ADDRESS,
    };

    it("should build expected tx body", async () => {
      const contract = PtonV2_1.create(PtonV2_1.address);

      const body = await contract.createDeployWalletBody({
        ...txArgs,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAUQAAnU9fQxMAAAAAAAAAAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKE8UP3"',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = PtonV2_1.create(PtonV2_1.address);

      const body = await contract.createDeployWalletBody({
        ...txArgs,
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAUQAAnU9fQxMAAAAAAAAwOYAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaI6imyT"',
      );
    });
  });

  describe("getDeployWalletTxParams", () => {
    const txArgs = {
      ownerAddress: ROUTER_WALLER_ADDRESS,
      excessAddress: USER_WALLET_ADDRESS,
    };

    const proivder = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = proivder.open(PtonV2_1.create(PtonV2_1.address));

      const txParams = await contract.getDeployWalletTxParams({
        ...txArgs,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAUQAAnU9fQxMAAAAAAAAAAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKE8UP3"',
      );
      expect(txParams.value).toMatchInlineSnapshot("100000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = proivder.open(PtonV2_1.create(PtonV2_1.address));

      const txParams = await contract.getDeployWalletTxParams({
        ...txArgs,
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAUQAAnU9fQxMAAAAAAAAwOYAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaI6imyT"',
      );
      expect(txParams.value).toMatchInlineSnapshot("100000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = proivder.open(PtonV2_1.create(PtonV2_1.address));

      const txParams = await contract.getDeployWalletTxParams({
        ...txArgs,
        gasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAUQAAnU9fQxMAAAAAAAAAAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKE8UP3"',
      );
      expect(txParams.value).toMatchInlineSnapshot("1n");
    });

    it("should build expected tx params when excessAddress is defined", async () => {
      const contract = proivder.open(PtonV2_1.create(PtonV2_1.address));

      const txParams = await contract.getDeployWalletTxParams({
        ...txArgs,
        excessAddress: PtonV2_1.address,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAUQAAnU9fQxMAAAAAAAAAAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCdACM3B12QK1e4yZSf8GtBRT0aLMNyEsBc/DhVfRRtOEffKUMv1h"',
      );
      expect(txParams.value).toMatchInlineSnapshot("100000000n");
    });
  });

  describe("sendDeployWallet", () => {
    it("should call getDeployWalletTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<PtonV2_1["sendDeployWallet"]>[2];

      const contract = PtonV2_1.create(PtonV2_1.address);

      const getDeployWalletTxParams = vi.spyOn(
        contract,
        "getDeployWalletTxParams",
      );

      const txParams = {} as Awaited<
        ReturnType<typeof contract.getDeployWalletTxParams>
      >;

      getDeployWalletTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendDeployWallet(provider, sender, txArgs);

      expect(getDeployWalletTxParams).toHaveBeenCalledWith(provider, txArgs);
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });
});
