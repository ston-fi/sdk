import type { Sender } from "@ton/ton";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  createMockObj,
  createMockProvider,
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "../../sdk/src/test-utils";

import { StakeNftMinter } from "./StakeNftMinter";

const USER_WALLET_ADDRESS = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";
const STAKE_TOKEN_ADDRESS = "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO"; // STON
const STAKE_MINTER_ADDRESS = "EQATQPeCwtMzQ9u54nTjUNcK4n_0VRSxPOOROLf_IE0OU3XK";

describe("StakeNftMinter", () => {
  beforeAll(setup);

  describe("create", () => {
    it("should return an instance of NftMinter", () => {
      const contract = StakeNftMinter.create(STAKE_MINTER_ADDRESS);

      expect(contract).toBeInstanceOf(StakeNftMinter);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(StakeNftMinter.gasConstants.stake).toMatchInlineSnapshot(
        "400000000n",
      );
      expect(StakeNftMinter.gasConstants.stakeForward).toMatchInlineSnapshot(
        "300000000n",
      );
    });
  });

  describe("constructor", () => {
    it("should create an instance of NftMinter", () => {
      const contract = StakeNftMinter.create(STAKE_MINTER_ADDRESS);

      expect(contract).toBeInstanceOf(StakeNftMinter);
    });

    it("should create an instance of NftMinter with default address", () => {
      const contract = new StakeNftMinter(STAKE_MINTER_ADDRESS);

      expect(contract.address.toString()).toEqual(STAKE_MINTER_ADDRESS);
    });

    it("should create an instance of NftMinter with given address", () => {
      const address = "EQDZNLoqxGKZRNeJJMXgRsiNOvgF5Ay3QeDcyza9XEZmCryj"; // just an address, not a real Stake minter contract

      const contract = new StakeNftMinter(address);

      expect(contract.address).toMatchInlineSnapshot(
        '"EQDZNLoqxGKZRNeJJMXgRsiNOvgF5Ay3QeDcyza9XEZmCryj"',
      );
    });

    it("should create an instance of NftMinter with default gasConstants", () => {
      const contract = new StakeNftMinter(STAKE_MINTER_ADDRESS);

      expect(contract.gasConstants).toEqual(StakeNftMinter.gasConstants);
    });

    it("should create an instance of NftMinter with given revision gasConstants", () => {
      const gasConstants: Partial<StakeNftMinter["gasConstants"]> = {
        stake: BigInt("1"),
      };

      const contract = new StakeNftMinter(STAKE_MINTER_ADDRESS, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createStakeBody", () => {
    const txArgs = {
      durationSeconds: 5,
    };

    it("should build expected tx body", async () => {
      const contract = StakeNftMinter.create(STAKE_MINTER_ADDRESS);

      const body = await contract.createStakeBody({
        ...txArgs,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADwAAGW7J3GUAAAAAAAAABQgcQ2n5"',
      );
    });

    it("should build expected tx body with defined custom durationSeconds", async () => {
      const contract = StakeNftMinter.create(STAKE_MINTER_ADDRESS);

      const body = await contract.createStakeBody({
        ...txArgs,
        durationSeconds: 5,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADwAAGW7J3GUAAAAAAAAABQgcQ2n5"',
      );
    });

    it("should build expected tx body with defined custom nftRecipient", async () => {
      const contract = StakeNftMinter.create(STAKE_MINTER_ADDRESS);

      const body = await contract.createStakeBody({
        ...txArgs,
        nftRecipient: "UQCB6eRHqJGDKVdCH4o9VqjNAhLyZTeKsUsLnlcelcXl-JOb", // Random address
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAMAAAW27J3GUAAAAAAAAABYAQPTyI9RIwZSroQ/FHqtUZoEJeTKbxVilhc8rj0ri8vwTLa6+D"',
      );
    });

    it("should build expected tx body with defined custom tokenRecipient", async () => {
      const contract = StakeNftMinter.create(STAKE_MINTER_ADDRESS);

      const body = await contract.createStakeBody({
        ...txArgs,
        tokenRecipient: "UQCB6eRHqJGDKVdCH4o9VqjNAhLyZTeKsUsLnlcelcXl-JOb", // Random address
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAMAAAW27J3GUAAAAAAAAABSAED08iPUSMGUq6EPxR6rVGaBCXkym8VYpYXPK49K4vL8R94IHS"',
      );
    });
  });

  describe("getStakeTxParams", async () => {
    const txArgs = {
      userWalletAddress: USER_WALLET_ADDRESS,
      jettonAddress: STAKE_TOKEN_ADDRESS,
      jettonAmount: "1000000000",
      durationSeconds: 5,
    };

    const snapshot = createProviderSnapshot().cell(
      "te6ccsEBAQEAJAAAAEOAGyaXRViMUyia8SSYvAjZEadfALyBlug8G5lm16uIzMFQUabizw==",
    );

    const provider = createMockProviderFromSnapshot(snapshot);

    it("should build expected tx params", async () => {
      const contract = provider.open(
        StakeNftMinter.create(STAKE_MINTER_ADDRESS),
      );

      const txParams = await contract.getStakeTxParams({
        ...txArgs,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQDZNLoqxGKZRNeJJMXgRsiNOvgF5Ay3QeDcyza9XEZmCryj"',
      );

      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAagABsA+KfqUAAAAAAAAAAEO5rKAIACaB7wWFpmaHt3PE6cahrhXE/+iqKWJ5xyJxb/5AmhynAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCCPDRgEBABluydxlAAAAAAAAAAUIEoBDPg=="',
      );

      expect(txParams.value).toStrictEqual(contract.gasConstants.stake);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(
        StakeNftMinter.create(STAKE_MINTER_ADDRESS),
      );

      const txParams = await contract.getStakeTxParams({
        ...txArgs,
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQDZNLoqxGKZRNeJJMXgRsiNOvgF5Ay3QeDcyza9XEZmCryj"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAagABsA+KfqUAAAAAAAAwOUO5rKAIACaB7wWFpmaHt3PE6cahrhXE/+iqKWJ5xyJxb/5AmhynAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCCPDRgEBABluydxlAAAAAAAAAAUIKPjeow=="',
      );

      expect(txParams.value).toStrictEqual(contract.gasConstants.stake);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(
        StakeNftMinter.create(STAKE_MINTER_ADDRESS),
      );

      const txParams = await contract.getStakeTxParams({
        ...txArgs,
        gasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQDZNLoqxGKZRNeJJMXgRsiNOvgF5Ay3QeDcyza9XEZmCryj"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAagABsA+KfqUAAAAAAAAAAEO5rKAIACaB7wWFpmaHt3PE6cahrhXE/+iqKWJ5xyJxb/5AmhynAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCCPDRgEBABluydxlAAAAAAAAAAUIEoBDPg=="',
      );

      expect(txParams.value).toMatchInlineSnapshot("1n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(
        StakeNftMinter.create(STAKE_MINTER_ADDRESS),
      );

      const txParams = await contract.getStakeTxParams({
        ...txArgs,
        forwardGasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQDZNLoqxGKZRNeJJMXgRsiNOvgF5Ay3QeDcyza9XEZmCryj"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAZwABqg+KfqUAAAAAAAAAAEO5rKAIACaB7wWFpmaHt3PE6cahrhXE/+iqKWJ5xyJxb/5AmhynAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaAgMBABluydxlAAAAAAAAAAUIfonaOQ=="',
      );

      expect(txParams.value).toStrictEqual(contract.gasConstants.stake);
    });

    it("should build expected tx params when custom nftRecipient is defined", async () => {
      const contract = provider.open(
        StakeNftMinter.create(STAKE_MINTER_ADDRESS),
      );

      const txParams = await contract.getStakeTxParams({
        ...txArgs,
        nftRecipient: "UQCB6eRHqJGDKVdCH4o9VqjNAhLyZTeKsUsLnlcelcXl-JOb", // Random address
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQDZNLoqxGKZRNeJJMXgRsiNOvgF5Ay3QeDcyza9XEZmCryj"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAiwABsA+KfqUAAAAAAAAAAEO5rKAIACaB7wWFpmaHt3PE6cahrhXE/+iqKWJ5xyJxb/5AmhynAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCCPDRgEBAFtuydxlAAAAAAAAAAWAED08iPUSMGUq6EPxR6rVGaBCXkym8VYpYXPK49K4vL8EmwuhNA=="',
      );

      expect(txParams.value).toStrictEqual(contract.gasConstants.stake);
    });

    it("should build expected tx params when custom tokenRecipient is defined", async () => {
      const contract = provider.open(
        StakeNftMinter.create(STAKE_MINTER_ADDRESS),
      );

      const txParams = await contract.getStakeTxParams({
        ...txArgs,
        tokenRecipient: "UQCB6eRHqJGDKVdCH4o9VqjNAhLyZTeKsUsLnlcelcXl-JOb", // Random address
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQDZNLoqxGKZRNeJJMXgRsiNOvgF5Ay3QeDcyza9XEZmCryj"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAiwABsA+KfqUAAAAAAAAAAEO5rKAIACaB7wWFpmaHt3PE6cahrhXE/+iqKWJ5xyJxb/5AmhynAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCCPDRgEBAFtuydxlAAAAAAAAAAUgBA9PIj1EjBlKuhD8Ueq1RmgQl5MpvFWKWFzyuPSuLy/ELYCPZQ=="',
      );

      expect(txParams.value).toStrictEqual(contract.gasConstants.stake);
    });

    it("should build expected tx params when custom jettonWalletAddress is defined", async () => {
      const contract = provider.open(
        StakeNftMinter.create(STAKE_MINTER_ADDRESS),
      );

      const txParams = await contract.getStakeTxParams({
        ...txArgs,
        jettonWalletAddress: "UQBpp-ANgRMrSvBFnNViih9x7og1kF_EFMeQn9s_qo60-b7O", // Random address
      });

      expect(txParams.to).toMatchInlineSnapshot(
        `"EQBpp-ANgRMrSvBFnNViih9x7og1kF_EFMeQn9s_qo60-eML"`,
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        `"te6cckEBAgEAagABsA+KfqUAAAAAAAAAAEO5rKAIACaB7wWFpmaHt3PE6cahrhXE/+iqKWJ5xyJxb/5AmhynAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCCPDRgEBABluydxlAAAAAAAAAAUIEoBDPg=="`,
      );
      expect(txParams.value).toMatchInlineSnapshot("400000000n");
    });
  });

  describe("sendStake", () => {
    it("should call getStakeTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<StakeNftMinter["sendStake"]>[2];

      const contract = StakeNftMinter.create(STAKE_MINTER_ADDRESS);

      const getStakeTxParams = vi.spyOn(contract, "getStakeTxParams");

      const txParams = {} as Awaited<
        ReturnType<typeof contract.getStakeTxParams>
      >;

      getStakeTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendStake(provider, sender, txArgs);

      expect(getStakeTxParams).toHaveBeenCalledWith(provider, txArgs);
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("getStakingMinterData", () => {
    const snapshot = createProviderSnapshot()
      .number("21396948712332186")
      .number("0")
      .number("0")
      .number("0")
      .number("0")
      .number("400425143490587268")
      .number("532004105")
      .number("0")
      .number("1693837802")
      .number("-1")
      .number("0")
      .number("0")
      .cell(
        "te6cckEBAQEAJAAAQ4ALPu0dyA1gHd3r7J1rxlvhXSvT5y3rokMDMiCQ86TsUJDnt69H",
      )
      .cell(
        "te6cckEBAQEAJAAAQ4AK/RXrS6su865BoWR55fnQXBxqsyHl5W/Wl3TuUgpS9JDMG4k4",
      );

    const provider = createMockProviderFromSnapshot(snapshot);

    it("should return expected data", async () => {
      const contract = provider.open(
        StakeNftMinter.create(STAKE_MINTER_ADDRESS),
      );

      const data = await contract.getStakingMinterData();

      expect(data.current_staked_tokens).toEqual(21396948712332186n);
      expect(data.claimed_fractionrewards).toEqual(0n);
      expect(data.accrued_per_vote_fractionrewards).toEqual(0n);
      expect(data.accrued_fractionrewards).toEqual(0n);
      expect(data.reward_remainder).toEqual(0n);
      expect(data.total_vote_power).toEqual(400425143490587268n);
      expect(data.id).toEqual(532004105n);
      expect(data.lock_date).toEqual(0n);
      expect(data.origin_time).toEqual(1693837802n);
      expect(data.is_reward_deposit_locked).toEqual(true);
      expect(data.is_contract_locked).toEqual(false);
      expect(data.allow_instant_unstake).toEqual(false);
      expect(data.staking_token_wallet.toString()).toEqual(
        "EQBZ92juQGsA7u9fZOteMt8K6V6fOW9dEhgZkQSHnSdihC4C",
      );
      expect(data.secondary_token_minter.toString()).toEqual(
        "EQBX6K9aXVl3nXINCyPPL86C4ONVmQ8vK360u6dykFKXpHCa",
      );
    });
  });
});
