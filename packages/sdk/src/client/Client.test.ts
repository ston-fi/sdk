import { StonApiClient } from "@ston-fi/api";
import { Address, beginCell, TonClient } from "@ton/ton";
import { describe, expect, it, vi } from "vitest";

import { Client } from "./Client";

const DEPENDENCIES = {
  endpoint: "https://toncenter.com/api/v2/jsonRPC",
};

describe("Client", () => {
  describe("constructor", () => {
    it("should create an instance of Client", () => {
      const client = new Client(DEPENDENCIES);

      expect(client).toBeInstanceOf(Client);
    });

    it("should extends TonClient", () => {
      const client = new Client(DEPENDENCIES);

      expect(client).toBeInstanceOf(TonClient);
    });

    it("should create an instance of StonApiClient if not provided", () => {
      const client = new Client(DEPENDENCIES);

      // @ts-expect-error: `stonApiClient` is private field. But for testing purposes it's ok
      expect(client.stonApiClient).toBeInstanceOf(StonApiClient);
    });

    it("should use provided StonApiClient", () => {
      const stonApiClient = new StonApiClient();
      const client = new Client({ ...DEPENDENCIES, stonApiClient });

      // @ts-expect-error: `stonApiClient` is private field. But for testing purposes it's ok
      expect(client.stonApiClient).toBe(stonApiClient);
    });
  });

  describe("callGetMethod", () => {
    const JETTON_ADDRESS = "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO";
    const OWNER_ADDRESS = "EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i";
    const JETTON_WALLET_ADDRESS =
      "EQDZNLoqxGKZRNeJJMXgRsiNOvgF5Ay3QeDcyza9XEZmCryj";

    it("should call super.callGetMethod if method is not get_wallet_address", async () => {
      const client = new Client(DEPENDENCIES);

      const callGetMethod = vi.spyOn(TonClient.prototype, "callGetMethod");
      callGetMethod.mockImplementation(() =>
        // @ts-expect-error: mock real implementation of callGetMethod method to avoid real network call
        Promise.resolve({ gas_used: 0, stack: [] }),
      );

      const args: Parameters<TonClient["callGetMethod"]> = [
        Address.parse(JETTON_ADDRESS),
        "not_get_wallet_address",
        [],
      ];

      await client.callGetMethod(...args);

      expect(callGetMethod).toBeCalledWith(...args);
    });

    it("should call stonApiClient.getJettonWalletAddress if method is get_wallet_address", async () => {
      const stonApiClient = new StonApiClient();

      const getJettonWalletAddress = vi.spyOn(
        StonApiClient.prototype,
        "getJettonWalletAddress",
      );
      getJettonWalletAddress.mockResolvedValue(JETTON_WALLET_ADDRESS);

      const client = new Client({
        ...DEPENDENCIES,
        stonApiClient,
      });

      const callGetMethod = vi.spyOn(TonClient.prototype, "callGetMethod");

      const args: Parameters<TonClient["callGetMethod"]> = [
        Address.parse("EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO"),
        "get_wallet_address",
        [
          {
            type: "slice",
            cell: beginCell()
              .storeAddress(Address.parse(OWNER_ADDRESS))
              .endCell(),
          },
        ],
      ];

      await client.callGetMethod(...args);

      expect(getJettonWalletAddress).toBeCalledWith({
        jettonAddress: "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO",
        ownerAddress: "EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i",
      });
      expect(callGetMethod).not.toBeCalled();
    });

    it("should call super.callGetMethod if method is get_wallet_address but stonApiClient.getJettonWalletAddress throws", async () => {
      const stonApiClient = new StonApiClient();

      const getJettonWalletAddress = vi.spyOn(
        StonApiClient.prototype,
        "getJettonWalletAddress",
      );
      getJettonWalletAddress.mockRejectedValue(
        new Error("Something went wrong"),
      );

      const client = new Client({
        ...DEPENDENCIES,
        stonApiClient,
      });

      const callGetMethod = vi.spyOn(TonClient.prototype, "callGetMethod");
      callGetMethod.mockImplementation(() =>
        // @ts-expect-error: mock real implementation of callGetMethod method to avoid real network call
        Promise.resolve({ gas_used: 0, stack: [] }),
      );

      const args: Parameters<TonClient["callGetMethod"]> = [
        Address.parse("EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO"),
        "get_wallet_address",
        [
          {
            type: "slice",
            cell: beginCell()
              .storeAddress(Address.parse(OWNER_ADDRESS))
              .endCell(),
          },
        ],
      ];

      await client.callGetMethod(...args);

      expect(getJettonWalletAddress).toBeCalled();
      expect(callGetMethod).toBeCalledWith(...args);
    });
  });
});
