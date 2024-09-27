import { beforeAll, describe, expect, it, vi } from "vitest";
import type { Sender } from "@ton/ton";

import {
  createMockObj,
  createMockProvider,
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "@/test-utils";

import { DEX_VERSION } from "../../constants";

import { VaultV2_1 } from "./VaultV2_1";

const USER_WALLET_ADDRESS = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";
const VAULT_ADDRESS = "EQB1HMY-_uCVDH4MkShZrf4tathj8_RNvdF6ChuFl7Vbt1tu"; // Vault for `USER_WALLET_ADDRESS` wallet and TestRED token

describe("VaultV2_1", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(VaultV2_1.version).toBe(DEX_VERSION.v2_1);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(VaultV2_1.gasConstants.withdrawFee).toMatchInlineSnapshot(
        "300000000n",
      );
    });
  });

  describe("constructor", () => {
    it("should create an instance of VaultV2_1", () => {
      const contract = VaultV2_1.create(VAULT_ADDRESS);

      expect(contract).toBeInstanceOf(VaultV2_1);
    });

    it("should create an instance of VaultV2_1 with default gasConstants", () => {
      const contract = VaultV2_1.create(VAULT_ADDRESS);

      expect(contract.gasConstants).toEqual(VaultV2_1.gasConstants);
    });

    it("should create an instance of VaultV2_1 with given gasConstants", () => {
      const gasConstants: Partial<VaultV2_1["gasConstants"]> = {
        withdrawFee: BigInt("1"),
      };

      const contract = new VaultV2_1(VAULT_ADDRESS, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createWithdrawFeeBody", () => {
    it("should build expected tx body", async () => {
      const contract = VaultV2_1.create(VAULT_ADDRESS);

      const body = await contract.createWithdrawFeeBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGDVLzfQAAAAAAAAAADRql48="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = VaultV2_1.create(VAULT_ADDRESS);

      const body = await contract.createWithdrawFeeBody({
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGDVLzfQAAAAAAAAwOcrqiIc="',
      );
    });
  });

  describe("getWithdrawFeeTxParams", () => {
    const provider = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = provider.open(VaultV2_1.create(VAULT_ADDRESS));

      const params = await contract.getWithdrawFeeTxParams();

      expect(params.to.toString()).toBe(VAULT_ADDRESS);
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGDVLzfQAAAAAAAAAADRql48="',
      );
      expect(params.value).toBe(contract.gasConstants.withdrawFee);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(VaultV2_1.create(VAULT_ADDRESS));

      const params = await contract.getWithdrawFeeTxParams({
        queryId: 12345,
      });

      expect(params.to.toString()).toBe(VAULT_ADDRESS);
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGDVLzfQAAAAAAAAwOcrqiIc="',
      );
      expect(params.value).toBe(contract.gasConstants.withdrawFee);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(VaultV2_1.create(VAULT_ADDRESS));

      const params = await contract.getWithdrawFeeTxParams({
        gasAmount: "1",
      });

      expect(params.to.toString()).toBe(VAULT_ADDRESS);
      expect(params.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGDVLzfQAAAAAAAAAADRql48="',
      );
      expect(params.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendWithdrawFee", () => {
    it("should call getWithdrawFeeTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<VaultV2_1["sendWithdrawFee"]>[2];

      const contract = VaultV2_1.create(VAULT_ADDRESS);

      const getWithdrawFeeTxParams = vi.spyOn(
        contract,
        "getWithdrawFeeTxParams",
      );

      const txParams = {} as Awaited<
        ReturnType<(typeof contract)["getWithdrawFeeTxParams"]>
      >;

      getWithdrawFeeTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendWithdrawFee(provider, sender, txArgs);

      expect(contract.getWithdrawFeeTxParams).toHaveBeenCalledWith(
        provider,
        txArgs,
      );
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("getVaultData", () => {
    it("should make on-chain request and return parsed response", async () => {
      const snapshot = createProviderSnapshot()
        .cell(
          "te6cckEBAQEAJAAAQ4ACE+JdUq+wPWHEaGeeZ6wHj2SzKrIOfTGgf/k9ACJZzRCUZNla",
        )
        .cell(
          "te6cckEBAQEAJAAAQ4AZd9jNEu8dzORwCo3lq1hM9p2LwjKwjSwTbaUbDUiFNzBy9LMe",
        )
        .cell(
          "te6cckEBAQEAJAAAQ4ABcPxIIJBRXcFelHACr/pLM4lgs7tR2lSYWSfwf2QNi1DQHKwZ",
        )
        .number("1");

      const provider = createMockProviderFromSnapshot(snapshot);

      const contract = provider.open(VaultV2_1.create(VAULT_ADDRESS));

      const data = await contract.getVaultData();

      expect(data.ownerAddress).toMatchInlineSnapshot(
        '"EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i"',
      );
      expect(data.tokenAddress).toMatchInlineSnapshot(
        '"EQDLvsZol3juZyOAVG8tWsJntOxeEZWEaWCbbSjYakQpuTjz"',
      );
      expect(data.routerAddress).toMatchInlineSnapshot(
        '"EQALh-JBBIKK7gr0o4AVf9JZnEsFndqO0qTCyT-D-yBsWval"',
      );
      expect(data.depositedAmount).toMatchInlineSnapshot("1n");
    });
  });
});
