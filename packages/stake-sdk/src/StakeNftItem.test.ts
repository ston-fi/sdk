import type { Sender } from "@ton/ton";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  createMockObj,
  createMockProvider,
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "../../sdk/src/test-utils";

import { StakeNftItem, StakeNftItemStatus } from "./StakeNftItem";

const STAKE_NFT_ADDRESS = "EQB_m_TcwPtapTWxf503QG2VwjkM10LuuBbXkOPfebdz5oHl";

describe("StakeNftItem", () => {
  beforeAll(setup);

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(StakeNftItem.gasConstants.claimRewards).toMatchInlineSnapshot(
        "300000000n",
      );
      expect(StakeNftItem.gasConstants.destroy).toMatchInlineSnapshot(
        "50000000n",
      );
      expect(StakeNftItem.gasConstants.restake).toMatchInlineSnapshot(
        "400000000n",
      );
      expect(StakeNftItem.gasConstants.unstake).toMatchInlineSnapshot(
        "300000000n",
      );
    });
  });

  describe("create", () => {
    it("should create an instance of NftItem", () => {
      const contract = StakeNftItem.create(STAKE_NFT_ADDRESS);

      expect(contract).toBeInstanceOf(StakeNftItem);
    });
  });

  describe("constructor", () => {
    it("should create an instance of NftItem", () => {
      const contract = StakeNftItem.create(STAKE_NFT_ADDRESS);

      expect(contract).toBeInstanceOf(StakeNftItem);
    });

    it("should create an instance of FarmNftItemV0_7 with default gasConstants", () => {
      const contract = StakeNftItem.create(STAKE_NFT_ADDRESS);

      expect(contract.gasConstants).toEqual(StakeNftItem.gasConstants);
    });

    it("should create an instance of FarmNftItemV0_7 with given gasConstants", () => {
      const gasConstants: Partial<StakeNftItem["gasConstants"]> = {
        destroy: BigInt("1"),
      };

      const contract = new StakeNftItem(STAKE_NFT_ADDRESS, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createUnstakeBody", () => {
    it("should build expected tx body", async () => {
      const contract = StakeNftItem.create(STAKE_NFT_ADDRESS);

      const body = await contract.createUnstakeBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGLkpZaAAAAAAAAAAAGt/uLY="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = StakeNftItem.create(STAKE_NFT_ADDRESS);

      const body = await contract.createUnstakeBody({ queryId: 12345 });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGLkpZaAAAAAAAAAwOZX/p74="',
      );
    });
  });

  describe("getUnstakeTxParams", () => {
    const provider = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = provider.open(StakeNftItem.create(STAKE_NFT_ADDRESS));

      const txParams = await contract.getUnstakeTxParams();

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQB_m_TcwPtapTWxf503QG2VwjkM10LuuBbXkOPfebdz5oHl"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGLkpZaAAAAAAAAAAAGt/uLY="',
      );
      expect(txParams.value).toEqual(contract.gasConstants.unstake);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(StakeNftItem.create(STAKE_NFT_ADDRESS));

      const txParams = await contract.getUnstakeTxParams({
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQB_m_TcwPtapTWxf503QG2VwjkM10LuuBbXkOPfebdz5oHl"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGLkpZaAAAAAAAAAwOZX/p74="',
      );
      expect(txParams.value).toEqual(contract.gasConstants.unstake);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(StakeNftItem.create(STAKE_NFT_ADDRESS));

      const txParams = await contract.getUnstakeTxParams({
        gasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQB_m_TcwPtapTWxf503QG2VwjkM10LuuBbXkOPfebdz5oHl"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGLkpZaAAAAAAAAAAAGt/uLY="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendUnstake", () => {
    it("should call getUnstakeTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<StakeNftItem["sendUnstake"]>[2];

      const contract = StakeNftItem.create(STAKE_NFT_ADDRESS);

      const getUnstakeTxParams = vi.spyOn(contract, "getUnstakeTxParams");

      const txParams = {} as Awaited<
        ReturnType<typeof contract.getUnstakeTxParams>
      >;

      getUnstakeTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendUnstake(provider, sender, txArgs);

      expect(getUnstakeTxParams).toHaveBeenCalledWith(provider, txArgs);
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("createRestakeBody", () => {
    it("should build expected tx body", async () => {
      const contract = StakeNftItem.create(STAKE_NFT_ADDRESS);

      const body = await contract.createRestakeBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAFgAAKBZJq+0AAAAAAAAAAAAAAAAAAAAA+9x7Fw=="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = StakeNftItem.create(STAKE_NFT_ADDRESS);

      const body = await contract.createRestakeBody({ queryId: 12345 });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAFgAAKBZJq+0AAAAAAAAwOQAAAAAAAAAAkEAYVw=="',
      );
    });

    it("should build expected tx body with defined custom durationSeconds", async () => {
      const contract = StakeNftItem.create(STAKE_NFT_ADDRESS);

      const body = await contract.createRestakeBody({
        durationSeconds: 5,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAFgAAKBZJq+0AAAAAAAAAAAAAAAAAAAAF58iKIg=="',
      );
    });
  });

  describe("getRestakeTxParams", () => {
    const provider = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = provider.open(StakeNftItem.create(STAKE_NFT_ADDRESS));

      const txParams = await contract.getRestakeTxParams();

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQB_m_TcwPtapTWxf503QG2VwjkM10LuuBbXkOPfebdz5oHl"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAFgAAKBZJq+0AAAAAAAAAAAAAAAAAAAAA+9x7Fw=="',
      );
      expect(txParams.value).toEqual(contract.gasConstants.restake);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(StakeNftItem.create(STAKE_NFT_ADDRESS));

      const txParams = await contract.getRestakeTxParams({
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQB_m_TcwPtapTWxf503QG2VwjkM10LuuBbXkOPfebdz5oHl"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAFgAAKBZJq+0AAAAAAAAwOQAAAAAAAAAAkEAYVw=="',
      );
      expect(txParams.value).toEqual(contract.gasConstants.restake);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(StakeNftItem.create(STAKE_NFT_ADDRESS));

      const txParams = await contract.getRestakeTxParams({
        gasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQB_m_TcwPtapTWxf503QG2VwjkM10LuuBbXkOPfebdz5oHl"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAFgAAKBZJq+0AAAAAAAAAAAAAAAAAAAAA+9x7Fw=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1n");
    });

    it("should build expected tx params when custom durationSeconds is defined", async () => {
      const contract = provider.open(StakeNftItem.create(STAKE_NFT_ADDRESS));

      const txParams = await contract.getRestakeTxParams({
        durationSeconds: 5,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQB_m_TcwPtapTWxf503QG2VwjkM10LuuBbXkOPfebdz5oHl"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAFgAAKBZJq+0AAAAAAAAAAAAAAAAAAAAF58iKIg=="',
      );
      expect(txParams.value).toEqual(contract.gasConstants.restake);
    });
  });

  describe("sendRestake", () => {
    it("should call getRestakeTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<StakeNftItem["sendRestake"]>[2];

      const contract = StakeNftItem.create(STAKE_NFT_ADDRESS);

      const getRestakeTxParams = vi.spyOn(contract, "getRestakeTxParams");

      const txParams = {} as Awaited<
        ReturnType<typeof contract.getRestakeTxParams>
      >;

      getRestakeTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendRestake(provider, sender, txArgs);

      expect(getRestakeTxParams).toHaveBeenCalledWith(provider, txArgs);
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("createClaimRewardsBody", () => {
    it("should build expected tx body", async () => {
      const contract = StakeNftItem.create(STAKE_NFT_ADDRESS);

      const body = await contract.createClaimRewardsBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGHjZ8QkAAAAAAAAAAP6Hl4w="',
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = StakeNftItem.create(STAKE_NFT_ADDRESS);

      const body = await contract.createClaimRewardsBody({
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGHjZ8QkAAAAAAAAwOQAHiIQ="',
      );
    });
  });

  describe("getClaimRewardsTxParams", () => {
    const provider = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = provider.open(StakeNftItem.create(STAKE_NFT_ADDRESS));

      const txParams = await contract.getClaimRewardsTxParams();

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQB_m_TcwPtapTWxf503QG2VwjkM10LuuBbXkOPfebdz5oHl"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGHjZ8QkAAAAAAAAAAP6Hl4w="',
      );
      expect(txParams.value).toEqual(contract.gasConstants.claimRewards);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(StakeNftItem.create(STAKE_NFT_ADDRESS));

      const txParams = await contract.getClaimRewardsTxParams({
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQB_m_TcwPtapTWxf503QG2VwjkM10LuuBbXkOPfebdz5oHl"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGHjZ8QkAAAAAAAAwOQAHiIQ="',
      );
      expect(txParams.value).toEqual(contract.gasConstants.claimRewards);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(StakeNftItem.create(STAKE_NFT_ADDRESS));

      const txParams = await contract.getClaimRewardsTxParams({
        gasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQB_m_TcwPtapTWxf503QG2VwjkM10LuuBbXkOPfebdz5oHl"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGHjZ8QkAAAAAAAAAAP6Hl4w="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("sendClaimRewards", () => {
    it("should call getClaimRewardsTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<StakeNftItem["sendClaimRewards"]>[2];

      const contract = StakeNftItem.create(STAKE_NFT_ADDRESS);

      const getClaimRewardsTxParams = vi.spyOn(
        contract,
        "getClaimRewardsTxParams",
      );

      const txParams = {} as Awaited<
        ReturnType<typeof contract.getClaimRewardsTxParams>
      >;

      getClaimRewardsTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendClaimRewards(provider, sender, txArgs);

      expect(getClaimRewardsTxParams).toHaveBeenCalledWith(provider, txArgs);
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("createDestroyBody", () => {
    it("should build expected tx body", async () => {
      const contract = StakeNftItem.create(STAKE_NFT_ADDRESS);

      const body = await contract.createDestroyBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        `"te6cckEBAQEADgAAGB8EU3oAAAAAAAAAAOpSrEg="`,
      );
    });

    it("should build expected tx body when queryId is defined", async () => {
      const contract = StakeNftItem.create(STAKE_NFT_ADDRESS);

      const body = await contract.createDestroyBody({
        queryId: 12345,
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        `"te6cckEBAQEADgAAGB8EU3oAAAAAAAAwORTSs0A="`,
      );
    });
  });

  describe("getDestroyTxParams", () => {
    const provider = createMockProvider();

    it("should build expected tx params", async () => {
      const contract = provider.open(StakeNftItem.create(STAKE_NFT_ADDRESS));

      const txParams = await contract.getDestroyTxParams();

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQB_m_TcwPtapTWxf503QG2VwjkM10LuuBbXkOPfebdz5oHl"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB8EU3oAAAAAAAAAAOpSrEg="',
      );
      expect(txParams.value).toEqual(contract.gasConstants.destroy);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(StakeNftItem.create(STAKE_NFT_ADDRESS));

      const txParams = await contract.getDestroyTxParams({
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQB_m_TcwPtapTWxf503QG2VwjkM10LuuBbXkOPfebdz5oHl"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB8EU3oAAAAAAAAwORTSs0A="',
      );
      expect(txParams.value).toEqual(contract.gasConstants.destroy);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(StakeNftItem.create(STAKE_NFT_ADDRESS));

      const txParams = await contract.getDestroyTxParams({
        gasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQB_m_TcwPtapTWxf503QG2VwjkM10LuuBbXkOPfebdz5oHl"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEADgAAGB8EU3oAAAAAAAAAAOpSrEg="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1n");
    });
  });

  describe("getStakingData", () => {
    const snapshot = createProviderSnapshot()
      .number("1")
      .number("0")
      .number("141422792")
      .number("1701727434")
      .number("1693838034")
      .number("100000000")
      .cell(
        "te6cckEBAQEAJAAAQ4AJM3eCX3JnqUxO+JZgUfh0vxJRcUgwcfwz4eBev/TfbhAuSwfl",
      )
      .number("12500000")
      .number("0");

    const provider = createMockProviderFromSnapshot(snapshot);

    it("should return expected data", async () => {
      const contract = provider.open(StakeNftItem.create(STAKE_NFT_ADDRESS));

      const result = await contract.getStakingData();

      expect(result.status).toEqual(1);
      expect(result.claimed_per_vote_fractionrewards).toEqual(0n);
      expect(result.vote_power).toEqual(141422792n);
      expect(result.min_unstake_date).toEqual(1701727434n);
      expect(result.lock_date).toEqual(1693838034n);
      expect(result.staked_tokens).toEqual(100000000n);
      expect(result.owner_address.toString()).toBe(
        "EQBJm7wS-5M9SmJ3xLMCj8Ol-JKLikGDj-GfDwL1_6b7cENC",
      );
      expect(result.secondary_tokens_minted).toEqual(12500000n);
      expect(result.revoke_time).toEqual(0n);
    });
  });
});

describe("StakeNftItemStatus", () => {
  it("should match expected shape", () => {
    expect(StakeNftItemStatus).toMatchInlineSnapshot(`
      {
        "ACTIVE": 1,
        "CLAIMING": 3,
        "UNINITIALIZED": 0,
        "UNSTAKED": 2,
      }
    `);
  });
});
