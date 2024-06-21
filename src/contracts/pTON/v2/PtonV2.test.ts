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

import { PtonV2 } from "./PtonV2";

const USER_WALLET_ADDRESS = "EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i";
const PROXY_TON_ADDRESS = "EQDwpyxrmYQlGDViPk-oqP4XK6J11I-bx7fJAlQCWmJB4tVy";

describe("PtonV2", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(PtonV2.version).toBe(pTON_VERSION.v2);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(PtonV2.gasConstants.tonTransfer).toMatchInlineSnapshot(
        "10000000n",
      );
    });
  });

  describe("create", () => {
    it("should create an instance of PtonV2", () => {
      const contract = PtonV2.create(PtonV2.address);

      expect(contract).toBeInstanceOf(PtonV2);
    });
  });

  describe("constructor", () => {
    it("should create an instance of PtonV2", () => {
      const contract = new PtonV2(PROXY_TON_ADDRESS);

      expect(contract).toBeInstanceOf(PtonV2);
    });

    it("should create an instance of RouterV1 with given address", () => {
      const contract = new PtonV2(USER_WALLET_ADDRESS); // just an address, not a real pTON v2 contract

      expect(contract.address.toString()).toEqual(USER_WALLET_ADDRESS);
    });
  });

  describe("getTonTransferTxParams", () => {
    const txArgs = {
      tonAmount: toNano(1),
      destinationAddress: "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt",
      refundAddress: USER_WALLET_ADDRESS,
    };

    const getWalletAddressSnapshot = createProviderSnapshot().cell(
      "te6cckEBAQEAJAAAQ4AInphPXsxLvV8GYIv91ynjTlgXyM3PUU8BZds8WqBZJbCdAP60",
    );

    const provider = createMockProviderFromSnapshot((address, method) => {
      if (address === PROXY_TON_ADDRESS && method === "get_wallet_address")
        return getWalletAddressSnapshot;

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(new PtonV2(PROXY_TON_ADDRESS));

      const txParams = await contract.getTonTransferTxParams(txArgs);

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBE9MJ69mJd6vgzBF_uuU8acsC-Rm56ingLLtni1QLJLbEL"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEANAAAYwHzg10AAAAAAAAAAEO5rKAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRRFUPGw=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1010000000n");
    });

    it("should build expected tx params when forwardPayload is defined", async () => {
      const contract = provider.open(new PtonV2(PROXY_TON_ADDRESS));

      const txParams = await contract.getTonTransferTxParams({
        ...txArgs,
        forwardPayload: beginCell().endCell(),
        forwardTonAmount: toNano(0.1),
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBE9MJ69mJd6vgzBF_uuU8acsC-Rm56ingLLtni1QLJLbEL"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEANwABZAHzg10AAAAAAAAAAEO5rKAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRAQAAEQ6zpA=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1110000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(new PtonV2(PROXY_TON_ADDRESS));

      const txParams = await contract.getTonTransferTxParams({
        ...txArgs,
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQBE9MJ69mJd6vgzBF_uuU8acsC-Rm56ingLLtni1QLJLbEL"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEANAAAYwHzg10AAAAAAAAwOUO5rKAIACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzR24kJEw=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1010000000n");
    });
  });

  describe("sendTonTransfer", () => {
    it("should call getTonTransferTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<PtonV2["sendTonTransfer"]>[2];

      const contract = new PtonV2(PROXY_TON_ADDRESS);

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
});
