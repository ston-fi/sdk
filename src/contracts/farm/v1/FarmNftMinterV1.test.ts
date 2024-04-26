import TonWeb from "tonweb";
import { describe, it, expect, vi } from "vitest";

import { createMockObj } from "@/test-utils";

import { FARM_VERSION } from "../constants";

import { FarmNftMinterV1 } from "./FarmNftMinterV1";

const {
  utils: { BN, bytesToBase64, base64ToBytes },
  boc: { Cell },
} = TonWeb;

const FARM_MINTER_ADDRESS = "EQCgKwUFWHhKyUUYBeG1PokxWhAtFyp5VcxU-sMXBrqma80u"; // ston/ton v1 farm minter
const FARM_TOKEN = "EQDtZHOtVWaf9UIU6rmjLPNLTGxNLNogvK5xUZlMRgZwQ4Gt"; // ston/ton LP token
const USER_WALLET_ADDRESS = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";

const DEPENDENCIES = {
  address: FARM_MINTER_ADDRESS,
  tonApiClient: createMockObj<InstanceType<typeof TonWeb.HttpProvider>>(),
};

describe("FarmNftMinterV1", () => {
  describe("version", () => {
    it("should have expected static value", () => {
      expect(FarmNftMinterV1.version).toBe(FARM_VERSION.v1);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(FarmNftMinterV1.gasConstants).toMatchInlineSnapshot(
        `
        {
          "stake": "11e1a300",
          "stakeForward": "0ee6b280",
        }
      `,
      );
    });
  });

  describe("constructor", () => {
    it("should create an instance of FarmNftMinterV1", () => {
      const contract = new FarmNftMinterV1({
        ...DEPENDENCIES,
      });

      expect(contract).toBeInstanceOf(FarmNftMinterV1);
    });

    it("should create an instance of FarmNftMinterV1 with default gasConstants", () => {
      const contract = new FarmNftMinterV1({
        ...DEPENDENCIES,
      });

      expect(contract.gasConstants).toEqual(FarmNftMinterV1.gasConstants);
    });

    it("should create an instance of FarmNftMinterV1 with given gasConstants", () => {
      const gasConstants: Partial<FarmNftMinterV1["gasConstants"]> = {
        stake: new BN("1"),
      };

      const contract = new FarmNftMinterV1({
        ...DEPENDENCIES,
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createStakeBody", () => {
    it("should build expected tx body", async () => {
      const contract = new FarmNftMinterV1({
        ...DEPENDENCIES,
      });

      // @ts-expect-error - method is protected
      const body = await contract.createStakeBody();

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEABgAAAAhuydxlxBqEvg=="',
      );
    });
  });

  describe("buildStakeTxParams", () => {
    const txArguments = {
      userWalletAddress: USER_WALLET_ADDRESS,
      jettonAddress: FARM_TOKEN,
      jettonAmount: new BN("1000000000"),
    };

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn(async (...args) => {
        if (args[0] === FARM_TOKEN && args[1] === "get_wallet_address") {
          return Cell.oneFromBoc(
            base64ToBytes(
              "te6ccsEBAQEAJAAAAEOAHFQxcq1rJvR/WddZfRdbC3/v2+tY+uTSBzqdnLahlpIwAkKqkA==",
            ),
          );
        }

        throw new Error(`Unexpected call2: ${args}`);
      }),
    });

    it("should build expected tx params", async () => {
      const contract = new FarmNftMinterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildStakeTxParams({
        ...txArguments,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQDioYuVa1k3o_rOusvouthb_37fWsfXJpA51OzltQy0kY_K"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAYQAAWwGwD4p+pQAAAAAAAAAAQ7msoAgBQFYKCrDwlZKKMAvDan0SYrQgWi5U8quYqfWGLg11TNcABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oIHc1lAQEACG7J3GVbVV1p"',
      );
      expect(params.gasAmount).toBe(contract.gasConstants.stake);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = new FarmNftMinterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildStakeTxParams({
        ...txArguments,
        queryId: 12345,
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQDioYuVa1k3o_rOusvouthb_37fWsfXJpA51OzltQy0kY_K"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAYQAAWwGwD4p+pQAAAAAAADA5Q7msoAgBQFYKCrDwlZKKMAvDan0SYrQgWi5U8quYqfWGLg11TNcABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oIHc1lAQEACG7J3GWN8M6D"',
      );
      expect(params.gasAmount).toBe(contract.gasConstants.stake);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = new FarmNftMinterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildStakeTxParams({
        ...txArguments,
        gasAmount: new BN("1"),
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQDioYuVa1k3o_rOusvouthb_37fWsfXJpA51OzltQy0kY_K"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAYQAAWwGwD4p+pQAAAAAAAAAAQ7msoAgBQFYKCrDwlZKKMAvDan0SYrQgWi5U8quYqfWGLg11TNcABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oIHc1lAQEACG7J3GVbVV1p"',
      );
      expect(params.gasAmount).toEqual(new BN("1"));
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = new FarmNftMinterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const params = await contract.buildStakeTxParams({
        ...txArguments,
        forwardGasAmount: new BN("1"),
      });

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"EQDioYuVa1k3o_rOusvouthb_37fWsfXJpA51OzltQy0kY_K"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAXgAAWAGqD4p+pQAAAAAAAAAAQ7msoAgBQFYKCrDwlZKKMAvDan0SYrQgWi5U8quYqfWGLg11TNcABCfEuqVfYHrDiNDPPM9YDx7JZlVkHPpjQP/yegBEs5oCAwEACG7J3GVmft6F"',
      );
      expect(params.gasAmount).toBe(contract.gasConstants.stake);
    });
  });

  describe("getData", () => {
    const snapshot = [
      new BN("1005"),
      new BN("1713448141"),
      new BN("3"),
      new BN("30000000000000000000000"),
      new BN("280398564"),
      new BN("539726098095"),
      new BN("29999999999958353284279"),
      new BN("29934432992205000000000"),
      new BN("2072561916"),
      new BN("666666666666000000000"),
      new BN("-1"),
      new BN("1209600"),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsEBAQEAJAAAAEOAF35ujiwyudcUiX1+gWS4fiO9LZtBrxq2cTbdZNGxLdfwQ7uV5g==",
        ),
      ),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsEBAQEAJAAAAEOAFCyYWNtTp3aw84nTIdXjpji+YMz/7pdk7+oJ6jAzL2LQaiqkuA==",
        ),
      ),
    ];

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn().mockResolvedValue(snapshot),
    });

    it("should make on-chain request and return parsed response", async () => {
      const contract = new FarmNftMinterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const data = await contract.getData();

      expect(data.nextItemIndex).toStrictEqual(new BN("1005"));
      expect(data.lastUpdateTime).toStrictEqual(new BN("1713448141"));
      expect(data.status).toBe(3);
      expect(data.depositedNanorewards).toStrictEqual(
        new BN("30000000000000000000000"),
      );
      expect(data.currentStakedTokens).toStrictEqual(new BN("280398564"));
      expect(data.accruedPerUnitNanorewards).toStrictEqual(
        new BN("539726098095"),
      );
      expect(data.accruedNanorewards).toStrictEqual(
        new BN("29999999999958353284279"),
      );
      expect(data.claimedNanorewards).toStrictEqual(
        new BN("29934432992205000000000"),
      );
      expect(data.contractUniqueId).toStrictEqual(new BN("2072561916"));
      expect(data.nanorewardsPer24h).toStrictEqual(
        new BN("666666666666000000000"),
      );
      expect(data.soulboundItems).toBe(true);
      expect(data.minStakeTime).toStrictEqual(new BN("1209600"));
      expect(data.stakingTokenWallet.toString()).toMatchInlineSnapshot(
        '"0:bbf374716195ceb8a44bebf40b25c3f11de96cda0d78d5b389b6eb268d896ebf"',
      );
      expect(data.rewardTokenWallet.toString()).toMatchInlineSnapshot(
        '"0:a164c2c6da9d3bb5879c4e990eaf1d31c5f30667ff74bb277f504f5181997b16"',
      );
    });
  });

  describe("getStakingJettonAddress", () => {
    it("should make on-chain request and return parsed response", async () => {
      const tonApiClient = createMockObj<
        InstanceType<typeof TonWeb.HttpProvider>
      >({
        call2: vi.fn(async (...args) => {
          if (
            args[0] === FARM_MINTER_ADDRESS &&
            args[1] === "get_farming_minter_data"
          ) {
            return [
              new BN("1005"),
              new BN("1713448141"),
              new BN("3"),
              new BN("30000000000000000000000"),
              new BN("280398564"),
              new BN("539726098095"),
              new BN("29999999999958353284279"),
              new BN("29934432992205000000000"),
              new BN("2072561916"),
              new BN("666666666666000000000"),
              new BN("-1"),
              new BN("1209600"),
              Cell.oneFromBoc(
                base64ToBytes(
                  "te6ccsEBAQEAJAAAAEOAF35ujiwyudcUiX1+gWS4fiO9LZtBrxq2cTbdZNGxLdfwQ7uV5g==",
                ),
              ),
              Cell.oneFromBoc(
                base64ToBytes(
                  "te6ccsEBAQEAJAAAAEOAFCyYWNtTp3aw84nTIdXjpji+YMz/7pdk7+oJ6jAzL2LQaiqkuA==",
                ),
              ),
            ];
          }

          if (
            args[0] ===
              "0:bbf374716195ceb8a44bebf40b25c3f11de96cda0d78d5b389b6eb268d896ebf" &&
            args[1] === "get_wallet_data"
          ) {
            return [
              new BN("280398565"),
              Cell.oneFromBoc(
                base64ToBytes(
                  "te6ccsEBAQEAJAAAAEOAFAVgoKsPCVkoowC8NqfRJitCBaLlTyq5ip9YYuDXVM1wneLmIw==",
                ),
              ),
              Cell.oneFromBoc(
                base64ToBytes(
                  "te6ccsEBAQEAJAAAAEOAHayOdaqs0/6oQp1XNGWeaWmNiaWbRBeVziozKYjAzghwrsu0tg==",
                ),
              ),
              Cell.oneFromBoc(
                base64ToBytes(
                  "te6ccsECDwEAAxUAAAAADQASABcAdQB6AH8A/QFVAVoB2gIUAlQCwgMFART/APSkE/S88sgLAQIBYgIOAgLMAwQAt9kGOASS+CcADoaYGAuNhKia+B+AZwfSB9IBj9ABi465D9ABj9ABgBaY+QwQgHxT9S3UqYmiz4BPAQwQgLxqKM3UsYoiIB+AVwGsEILK+D3l1JrPgF8C+CQgf5eEAgEgBQ0CASAGCAH1UD0z/6APpAcCKAVQH6RDBYuvL07UTQ+gD6QPpA1DBRNqFSKscF8uLBKML/8uLCVDRCcFQgE1QUA8hQBPoCWM8WAc8WzMkiyMsBEvQA9ADLAMkg+QBwdMjLAsoHy//J0AT6QPQEMfoAINdJwgDy4sR3gBjIywVQCM8WcIBwCs+gIXy2sTzIIQF41FGcjLHxnLP1AH+gIizxZQBs8WJfoCUAPPFslQBcwjkXKRceJQCKgToIIJycOAoBS88uLFBMmAQPsAECPIUAT6AljPFgHPFszJ7VQCASAJDAL3O1E0PoA+kD6QNQwCNM/+gBRUaAF+kD6QFNbxwVUc21wVCATVBQDyFAE+gJYzxYBzxbMySLIywES9AD0AMsAyfkAcHTIywLKB8v/ydBQDccFHLHy4sMK+gBRqKGCCJiWgGa2CKGCCJiWgKAYoSeXEEkQODdfBOMNJdcLAYAoLAHBSeaAYoYIQc2LQnMjLH1Iwyz9Y+gJQB88WUAfPFslxgBjIywUkzxZQBvoCFctqFMzJcfsAECQQIwB8wwAjwgCwjiGCENUydttwgBDIywVQCM8WUAT6AhbLahLLHxLLP8ly+wCTNWwh4gPIUAT6AljPFgHPFszJ7VQA1ztRND6APpA+kDUMAfTP/oA+kAwUVGhUknHBfLiwSfC//LiwgWCCTEtAKAWvPLiw4IQe92X3sjLHxXLP1AD+gIizxYBzxbJcYAYyMsFJM8WcPoCy2rMyYBA+wBAE8hQBPoCWM8WAc8WzMntVIACB1AEGuQ9qJofQB9IH0gahgCaY+QwQgLxqKM3QFBCD3uy+9dCVj5cWLpn5j9ABgJ0CgR5CgCfQEsZ4sA54tmZPaqQAG6D2BdqJofQB9IH0gahhq3vDTA==",
                ),
              ),
            ];
          }

          throw new Error(`Unexpected call2: ${args}`);
        }),
      });

      const contract = new FarmNftMinterV1({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const address = await contract.getStakingJettonAddress();

      expect(address.toString()).toMatchInlineSnapshot(
        '"0:ed6473ad55669ff54214eab9a32cf34b4c6c4d2cda20bcae7151994c46067043"',
      );
    });
  });
});
