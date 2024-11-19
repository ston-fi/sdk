import { type Sender, beginCell, toNano } from "@ton/ton";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  createMockObj,
  createMockProvider,
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "../../../test-utils";
import { toAddress } from "../../../utils/toAddress";
import { pTON_VERSION } from "../constants";
import { PtonV1 } from "./PtonV1";

const USER_WALLET_ADDRESS = "EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i";

describe("PtonV1", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(PtonV1.version).toBe(pTON_VERSION.v1);
    });
  });

  describe("address", () => {
    it("should have expected static value", () => {
      expect(PtonV1.address.toString()).toMatchInlineSnapshot(
        '"EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez"',
      );
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(PtonV1.gasConstants.deployWallet).toMatchInlineSnapshot(
        "1050000000n",
      );
    });
  });

  describe("create", () => {
    it("should create an instance of PtonV1", () => {
      const contract = PtonV1.create(PtonV1.address);

      expect(contract).toBeInstanceOf(PtonV1);
    });
  });

  describe("constructor", () => {
    it("should create an instance of PtonV1", () => {
      const contract = new PtonV1();

      expect(contract).toBeInstanceOf(PtonV1);
    });

    it("should create an instance of PtonV1 with default address", () => {
      const contract = new PtonV1();

      expect(contract.address).toEqual(PtonV1.address);
    });

    it("should create an instance of PtonV1 with given address", () => {
      const contract = new PtonV1(USER_WALLET_ADDRESS);

      expect(contract.address.toString()).toEqual(USER_WALLET_ADDRESS);
    });

    it("should create an instance of PtonV1 with default gasConstants", () => {
      const contract = new PtonV1();

      expect(contract.gasConstants).toEqual(PtonV1.gasConstants);
    });

    it("should create an instance of PtonV1 with given gasConstants", () => {
      const gasConstants: Partial<PtonV1["gasConstants"]> = {
        deployWallet: BigInt("1"),
      };

      const contract = new PtonV1(PtonV1.address, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });

    it("should create an instance of PtonV1 with correct version", () => {
      const contract = PtonV1.create(PtonV1.address);

      expect(contract.version).toEqual(PtonV1.version);
    });
  });

  describe("getTonTransferTxParams", () => {
    const txArgs = {
      tonAmount: toNano(1),
      destinationAddress: "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt",
      refundAddress: USER_WALLET_ADDRESS,
    };

    const getWalletAddressSnapshot = createProviderSnapshot().cell(
      "te6cckEBAQEAJAAAQ4ANNPwBsCJlaV4Is5qsUUPuPdEGsgv4gpjyE/tn9VHWnzAClbSC",
    );

    const provider = createMockProviderFromSnapshot((address, method) => {
      if (
        toAddress(address).equals(PtonV1.address) &&
        method === "get_wallet_address"
      )
        return getWalletAddressSnapshot;

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(new PtonV1());

      const txParams = await contract.getTonTransferTxParams(txArgs);

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBpp-ANgRMrSvBFnNViih9x7og1kF_EFMeQn9s_qo60-eML"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEANQAAZQ+KfqUAAAAAAAAAAEO5rKAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCcAdFEo1U="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1000000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(new PtonV1());

      const txParams = await contract.getTonTransferTxParams({
        ...txArgs,
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBpp-ANgRMrSvBFnNViih9x7og1kF_EFMeQn9s_qo60-eML"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEANQAAZQ+KfqUAAAAAAAAwOUO5rKAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCcAT6CEJk="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1000000000n");
    });

    it("should build expected tx params when forwardPayload is defined", async () => {
      const contract = provider.open(new PtonV1());

      const txParams = await contract.getTonTransferTxParams({
        ...txArgs,
        forwardPayload: beginCell().endCell(),
        forwardTonAmount: toNano(0.1),
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBpp-ANgRMrSvBFnNViih9x7og1kF_EFMeQn9s_qo60-eML"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAPAABbQ+KfqUAAAAAAAAAAEO5rKAIAO87mQKicbKgHIk4pSPP4k5xhHqutqYgAB7USnesDnCcEBfXhAMBAACDD/1r"',
      );
      expect(txParams.value).toMatchInlineSnapshot("1100000000n");
    });
  });

  describe("sendTonTransfer", () => {
    it("should call getTonTransferTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<PtonV1["sendTonTransfer"]>[2];

      const contract = new PtonV1();

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
      ownerAddress: USER_WALLET_ADDRESS,
    };

    it("should build expected tx body", async () => {
      const contract = new PtonV1();

      const body = await contract.createDeployWalletBody({
        ...txArgs,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAMAAAW2zENXMAAAAAAAAAAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRD9A4zf"',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = new PtonV1();

      const body = await contract.createDeployWalletBody({
        ...txArgs,
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAMAAAW2zENXMAAAAAAAAwOYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRA0o0Ga"',
      );
    });
  });

  describe("getDeployWalletTxParams", () => {
    const txArgs = {
      ownerAddress: USER_WALLET_ADDRESS,
    };

    const proivder = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = proivder.open(new PtonV1());

      const txParams = await contract.getDeployWalletTxParams({
        ...txArgs,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAMAAAW2zENXMAAAAAAAAAAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRD9A4zf"',
      );
      expect(txParams.value).toMatchInlineSnapshot("1050000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = proivder.open(new PtonV1());

      const txParams = await contract.getDeployWalletTxParams({
        ...txArgs,
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAMAAAW2zENXMAAAAAAAAwOYACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRA0o0Ga"',
      );
      expect(txParams.value).toMatchInlineSnapshot("1050000000n");
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = proivder.open(new PtonV1());

      const txParams = await contract.getDeployWalletTxParams({
        ...txArgs,
        gasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAMAAAW2zENXMAAAAAAAAAAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRD9A4zf"',
      );
      expect(txParams.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendDeployWallet", () => {
    it("should call getDeployWalletTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<PtonV1["sendDeployWallet"]>[2];

      const contract = PtonV1.create(PtonV1.address);

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
