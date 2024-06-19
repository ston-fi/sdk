import { beforeAll, describe, expect, it, vi } from "vitest";
import type { Sender } from "@ton/ton";

import {
  createMockProvider,
  createMockObj,
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "@/test-utils";

import { FARM_VERSION } from "../constants";

import { FarmNftMinterV3 } from "./FarmNftMinterV3";

const ADDRESS = "EQCp5szP3mCqAY11tzhdo7RElDzilThbPuzUF2zTeyYG5Vyz";

beforeAll(setup);

describe("FarmNftMinterV3", () => {
  describe("version", () => {
    it("should have expected static value", () => {
      expect(FarmNftMinterV3.version).toBe(FARM_VERSION.v3);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(FarmNftMinterV3.gasConstants.stake).toMatchInlineSnapshot(
        "100000000n",
      );
      expect(FarmNftMinterV3.gasConstants.stakeFwdBase).toMatchInlineSnapshot(
        "210000000n",
      );
      expect(
        FarmNftMinterV3.gasConstants.stakeFwdPerPool,
      ).toMatchInlineSnapshot("15000000n");
    });
  });

  describe("create", () => {
    it("should create an instance of FarmNftMinterV3 from address", () => {
      const contract = FarmNftMinterV3.create(ADDRESS);

      expect(contract).toBeInstanceOf(FarmNftMinterV3);
    });
  });

  describe("constructor", () => {
    it("should create an instance of FarmNftMinterV3", () => {
      const contract = new FarmNftMinterV3(ADDRESS);

      expect(contract).toBeInstanceOf(FarmNftMinterV3);
    });

    it("should create an instance of FarmNftMinterV3 with default gasConstants", () => {
      const contract = new FarmNftMinterV3(ADDRESS);

      expect(contract.gasConstants).toEqual(FarmNftMinterV3.gasConstants);
    });

    it("should create an instance of FarmNftMinterV3 with given gasConstants", () => {
      const gasConstants: Partial<FarmNftMinterV3["gasConstants"]> = {
        stake: BigInt("1"),
      };

      const contract = new FarmNftMinterV3(ADDRESS, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createStakeBody", () => {
    it("should build expected tx body", async () => {
      const contract = new FarmNftMinterV3(ADDRESS);

      const body = await contract.createStakeBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEABwAACW7J3GUgVLKEdQ=="',
      );
    });

    it("should build expected tx body when ownerAddress is defined", async () => {
      const contract = new FarmNftMinterV3(ADDRESS);

      const body = await contract.createStakeBody({
        ownerAddress: "EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i",
      });

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAKAAAS27J3GWAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0Q1zGHBA=="',
      );
    });
  });

  describe("getStakeTxParams", () => {
    const txArgs = {
      userWalletAddress: "EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i",
      jettonAddress: "EQDtZHOtVWaf9UIU6rmjLPNLTGxNLNogvK5xUZlMRgZwQ4Gt",
      jettonAmount: "1000000000",
      poolCount: 1,
    };

    const provider = createMockProviderFromSnapshot((address, method) => {
      if (address === txArgs.jettonAddress && method === "get_wallet_address") {
        return createProviderSnapshot().cell(
          "te6ccsEBAQEAJAAAAEOAHFQxcq1rJvR/WddZfRdbC3/v2+tY+uTSBzqdnLahlpIwAkKqkA==",
        );
      }

      throw new Error(`Unexpected call: ${address} ${method}`);
    });

    it("should build expected tx params", async () => {
      const contract = provider.open(FarmNftMinterV3.create(ADDRESS));

      const txParams = await contract.getStakeTxParams({
        ...txArgs,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQDioYuVa1k3o_rOusvouthb_37fWsfXJpA51OzltQy0kY_K"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAYgABsA+KfqUAAAAAAAAAAEO5rKAIAVPNmZ+8wVQDGutucLtHaIkoecUqcLZ92agu2ab2TA3LAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAAluydxlIPyUeZ4="',
      );
      expect(txParams.value).toMatchInlineSnapshot("340000000n");
    });

    it("should build expected tx params when ownerAddress is defined", async () => {
      const contract = provider.open(FarmNftMinterV3.create(ADDRESS));

      const txParams = await contract.getStakeTxParams({
        ...txArgs,
        ownerAddress: "EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQDioYuVa1k3o_rOusvouthb_37fWsfXJpA51OzltQy0kY_K"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAgwABsA+KfqUAAAAAAAAAAEO5rKAIAVPNmZ+8wVQDGutucLtHaIkoecUqcLZ92agu2ab2TA3LAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAEtuydxlgAIT4l1Sr7A9YcRoZ55nrAePZLMqsg59MaB/+T0AIlnNEJH7/PU="',
      );
      expect(txParams.value).toMatchInlineSnapshot("340000000n");
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(FarmNftMinterV3.create(ADDRESS));

      const txParams = await contract.getStakeTxParams({
        ...txArgs,
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQDioYuVa1k3o_rOusvouthb_37fWsfXJpA51OzltQy0kY_K"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAYgABsA+KfqUAAAAAAAAwOUO5rKAIAVPNmZ+8wVQDGutucLtHaIkoecUqcLZ92agu2ab2TA3LAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCBycOAEBAAluydxlIBoB4Ws="',
      );
      expect(txParams.value).toMatchInlineSnapshot("340000000n");
    });

    it("gasAmount should be different based on poolCount", async () => {
      const poolsToGasMap = [
        [1, "340000000"],
        [2, "355000000"],
        [3, "370000000"],
      ] as const;

      const contract = provider.open(FarmNftMinterV3.create(ADDRESS));

      expect(
        await Promise.all(
          poolsToGasMap.map(async ([poolCount]) => {
            const txParams = await contract.getStakeTxParams({
              ...txArgs,
              poolCount,
            });

            return txParams.value.toString();
          }),
        ),
      ).toEqual(poolsToGasMap.map(([_, gasAmount]) => gasAmount));
    });
  });

  describe("sendStake", () => {
    it("should call getStakeTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<FarmNftMinterV3["sendStake"]>[2];

      const contract = FarmNftMinterV3.create(ADDRESS);

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

  describe("getVersion", () => {
    const snapshot = createProviderSnapshot()
      .number("3")
      .number("0")
      .cell("te6ccsEBAQEACQAAAA5yZWxlYXNlKoIKQw==");

    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(FarmNftMinterV3.create(ADDRESS));

      const data = await contract.getVersion();

      expect(data.major).toStrictEqual(3);
      expect(data.minor).toStrictEqual(0);
      expect(data.development).toStrictEqual("release");
    });
  });

  describe("getFarmingMinterData", () => {
    const snapshot = createProviderSnapshot()
      .number("2259")
      .number("1")
      .number("3")
      .number("248359521312")
      .number("103037229")
      .number("864000")
      .cell(
        "te6ccsEBAQEAJAAAAEOAB6QiQ0T/22/J+dCm9MMTbVU4qD4ojxQrph7+3gjW7q+QCf49AQ==",
      )
      .cell(
        "te6ccsEBAQEAJAAAAEOAE1XEnRcjRVi9UD7WrYvKkVyYXqugt8gbjnnHwqvEhL6wioVD+g==",
      )
      .number("-1")
      .number("-1")
      .cell(
        "te6ccsECCAEAAYcAAAAABQAKAA4AiQCNAQgBDAIBzQEGAgEgAgQBASADAPEAAAAAAAAAAAA23yPjcpaKGoAAAAAAAAAAAAAAAAAAAAPuFyutcAAAAAAAAAAAAqExE+k7MX4/iMAAAAAAAAAAAAe2FsLOQZKqRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZik3ToAQEgBQDxAAAAAAAAAAAAKloFj8KV7QAAAAAAAAAAAAAAAAAAAAADCIg3IIAAAAAAAAAAAAIHlyQrccQTlPJAAAAAAAAAAAAF86nbNP1sAeYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGYpN06AEBSAcA8QAAAAAAAAAAAAh4Z4NLTALKgAAAAAAAAAAAAAAAAAAAAHePkTPAAAAAAAAAAAAAV/Q9o73v1EmfwAAAAAAAAAAAAODc/cNWk3SaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmKTdOh6Xm5I",
      )
      .cell(
        "te6ccsEBCAEAxAAABQoOSEyGigIBzQEGAgEgAgQBASADAG8AAAAAAAAAAAAAAAHUPO36EjkQkAMAOevgarWLP/P2hL1ntIUBWX6WSBO92ecxt2sYIVc5dj5gIgEBIAUAbwAAAAAAAAAAAAAAAWlmldvRLTiQAwAcvewmHxjAY9t6LA5qs8aaoI2mVS+xBDKNyAvJWZOSGiAiAQFIBwBvAAAAAAAAAAAAAAAAbMlsqFVJlJADAAifWbxZ3ejqWZqGvBoCj7QafH5DzTJGXkbhA09Ad3ViICJCsQ3c",
      );

    const provider = createMockProviderFromSnapshot(snapshot);

    it("should return data about the farm NFT contract state", async () => {
      const contract = provider.open(FarmNftMinterV3.create(ADDRESS));

      const farmingData = await contract.getFarmingMinterData();

      expect(farmingData.nextItemIndex).toMatchInlineSnapshot("2259n");
      expect(farmingData.status).toMatchInlineSnapshot("1");
      expect(farmingData.poolCount).toMatchInlineSnapshot("3");
      expect(farmingData.currentStakedTokens).toMatchInlineSnapshot(
        "248359521312n",
      );
      expect(farmingData.contractUniqueId).toMatchInlineSnapshot("103037229n");
      expect(farmingData.stakingTokenWallet).toMatchInlineSnapshot(
        '"EQA9IRIaJ_7bfk_OhTemGJtqqcVB8UR4oV0w9_bwRrd1fKMW"',
      );
      expect(farmingData.custodianAddress).toMatchInlineSnapshot(
        '"EQCariTouRoqxeqB9rVsXlSK5ML1XQW-QNxzzj4VXiQl9Vix"',
      );
      expect(farmingData.canChangeCustodian).toBe(true);
      expect(farmingData.canSendRawMsg).toBe(true);
      expect(farmingData.farmDataParameters).toMatchInlineSnapshot(
        `
        Map {
          0 => {
            "adminFee": 0n,
            "canChangeFee": true,
            "nanorewardsPer24h": 2159366666666000000000n,
            "rewardTokenWallet": "EQDnr4Gq1iz_z9oS9Z7SFAVl-lkgTvdnnMbdrGCFXOXY-ZgJ",
            "status": 1,
            "unrestrictedDepositRewards": true,
          },
          1 => {
            "adminFee": 0n,
            "canChangeFee": true,
            "nanorewardsPer24h": 1666666666666000000000n,
            "rewardTokenWallet": "EQBy97CYfGMBj23osDmqzxpqgjaZVL7EEMo3IC8lZk5IaIiP",
            "status": 1,
            "unrestrictedDepositRewards": true,
          },
          2 => {
            "adminFee": 0n,
            "canChangeFee": true,
            "nanorewardsPer24h": 501690630186000000000n,
            "rewardTokenWallet": "EQAifWbxZ3ejqWZqGvBoCj7QafH5DzTJGXkbhA09Ad3ViDBq",
            "status": 1,
            "unrestrictedDepositRewards": true,
          },
        }
      `,
      );
      expect(farmingData.farmDataAccrued).toMatchInlineSnapshot(
        `
        Map {
          0 => {
            "accruedFeeNanorewards": 49672780752717547634211n,
            "accruedNanorewards": 0n,
            "accruedPerUnitNanorewards": 270070364887n,
            "claimedFeeNanorewards": 0n,
            "claimedNanorewards": 36415512901498000000000n,
            "depositedNanorewards": 64781000010000000000000n,
            "lastUpdateTime": 1713977166n,
          },
          1 => {
            "accruedFeeNanorewards": 38339004207287067628489n,
            "accruedNanorewards": 0n,
            "accruedPerUnitNanorewards": 208448745992n,
            "claimedFeeNanorewards": 0n,
            "claimedNanorewards": 28106630658935000000000n,
            "depositedNanorewards": 50000000000000000000000n,
            "lastUpdateTime": 1713977166n,
          },
          2 => {
            "accruedFeeNanorewards": 6489864549470930282111n,
            "accruedNanorewards": 0n,
            "accruedPerUnitNanorewards": 32094360380n,
            "claimedFeeNanorewards": 0n,
            "claimedNanorewards": 4147994771145000000000n,
            "depositedNanorewards": 10000000010000000000000n,
            "lastUpdateTime": 1713977166n,
          },
        }
      `,
      );
    });
  });
});
