import TonWeb from 'tonweb';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { Router } from '@/contracts/router/Router';
import { PoolRevisionV1 } from '@/contracts/pool/PoolRevisionV1';
import { createMockObj } from '@/test';

import { RouterRevisionV1 } from './RouterRevisionV1';

const {
  Address,
  boc: { Cell },
  utils: { BN, bytesToBase64, base64ToBytes },
} = TonWeb;

const ROUTER_ADDRESS_STR = 'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt';
const ROUTER = createMockObj<Router>({
  getAddress: vi.fn(() => new Address(ROUTER_ADDRESS_STR)),
});

describe('RouterRevisionV1', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('gasConstants', () => {
    it('should return expected gas constants', () => {
      const { gasConstants } = new RouterRevisionV1();

      expect(gasConstants.swap.toString()).toMatchInlineSnapshot('"300000000"');
      expect(gasConstants.provideLp.toString()).toMatchInlineSnapshot(
        '"300000000"',
      );
      expect(gasConstants.swapForward.toString()).toMatchInlineSnapshot(
        '"265000000"',
      );
      expect(gasConstants.provideLpForward.toString()).toMatchInlineSnapshot(
        '"265000000"',
      );
    });
  });

  describe('createSwapBody', () => {
    it('should create body with expected content', async () => {
      const router = ROUTER;
      const revision = new RouterRevisionV1();

      const body = await revision.createSwapBody(router, {
        userWalletAddress: 'EQB3YmWW5ZLhe2gPUAw550e2doyWnkj5hzv3TXp2ekpAWe7v',
        minAskAmount: new BN(900000000),
        askJettonWalletAddress:
          'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi',
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEATgAAAJclk4VhgBf6sUGeIgxYm+8y590OuC7q1yOfm+GvdwIRdgN2yvW/iGtJ0gEAHdiZZblkuF7aA9QDDnnR7Z2jJaeSPmHO/dNenZ6SkBZQmz2Wnw=="',
      );
    });
    it('should create body with expected content when referralAddress is defined', async () => {
      const router = ROUTER;
      const revision = new RouterRevisionV1();

      const body = await revision.createSwapBody(router, {
        userWalletAddress: 'EQB3YmWW5ZLhe2gPUAw550e2doyWnkj5hzv3TXp2ekpAWe7v',
        minAskAmount: new BN(900000000),
        askJettonWalletAddress:
          'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi',
        referralAddress: 'EQCguqiHctoMqY28fFHWuXnY9XY-2ju1ZPBakEZa7f3Q7hr9',
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAbwAAANklk4VhgBf6sUGeIgxYm+8y590OuC7q1yOfm+GvdwIRdgN2yvW/iGtJ0gEAHdiZZblkuF7aA9QDDnnR7Z2jJaeSPmHO/dNenZ6SkBZwAoLqoh3LaDKmNvHxR1rl52PV2Pto7tWTwWpBGWu390O6BK5Y3w=="',
      );
    });
  });

  describe('createProvideLiquidityBody', () => {
    it('should create body with expected content', async () => {
      const router = ROUTER;
      const revision = new RouterRevisionV1();

      const body = await revision.createProvideLiquidityBody(router, {
        routerWalletAddress: 'EQB3YmWW5ZLhe2gPUAw550e2doyWnkj5hzv3TXp2ekpAWe7v',
        minLpOut: new BN(900000000),
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEALAAAAFP8+eWPgA7sTLLcslwvbQHqAYc86PbO0ZLTyR8w537pr07PSUgLKGtJ0gGiLFKe"',
      );
    });
  });

  describe('getPoolAddress', () => {
    it('should return expected pool address for given jetton pair', async () => {
      const router = createMockObj<Router>({
        ...ROUTER,
        provider: {
          call2: vi
            .fn()
            .mockResolvedValue(
              Cell.oneFromBoc(
                base64ToBytes(
                  'te6ccsEBAQEAJAAAAEOAHnJWFF5J7OlK67l/3A4kW2jr6DgApxApCROKUiP45JIQWu7fpg==',
                ),
              ),
            ),
        },
      });
      const revision = new RouterRevisionV1();

      const token0 = 'EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv';
      const token1 = 'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi';

      const poolAddress = await revision.getPoolAddress(router, {
        token0,
        token1,
      });

      expect(router.provider.call2).toBeCalledTimes(1);
      expect(router.provider.call2).toBeCalledWith(
        ROUTER_ADDRESS_STR,
        'get_pool_address',
        [
          [
            'tvm.Slice',
            'te6cckEBAQEAJAAAQ4AaFDnJm4MPjywr1MMXrYUsL170rbLN60MlTtHmi9zH+lBwRY/g',
          ],
          [
            'tvm.Slice',
            'te6cckEBAQEAJAAAQ4AX+rFBniIMWJvvMufdDrgu6tcjn5vhr3cCEXYDdsr1v5Aig4iI',
          ],
        ],
      );

      expect(poolAddress?.toString()).toMatchInlineSnapshot(
        '"0:f392b0a2f24f674a575dcbfee07122db475f41c005388148489c52911fc72490"',
      );
    });
  });

  describe('getData', () => {
    it('should return expected data about the pool', async () => {
      const router = createMockObj<Router>({
        ...ROUTER,
        provider: {
          call2: vi
            .fn()
            .mockResolvedValue([
              new BN(0),
              Cell.oneFromBoc(
                base64ToBytes(
                  'te6ccsEBAQEAJAAAAEOACTN3gl9yZ6lMTviWYFH4dL8SUXFIMHH8M+HgXr/0324Q2cH+VQ==',
                ),
              ),
              Cell.oneFromBoc(
                base64ToBytes(
                  'te6ccsEBAgEAFgAAFAEhAAAAAAAAAAAAAAAAAAAAACABAAAAkbB8',
                ),
              ),
              Cell.oneFromBoc(
                base64ToBytes(
                  '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',
                ),
              ),
              Cell.oneFromBoc(
                base64ToBytes(
                  'te6ccsECDwEAAxUAAAAADQASABcAdQB6AH8A/QFVAVoB2gIUAlQCwgMFART/APSkE/S88sgLAQIBYgIOAgLMAwQAt9kGOASS+CcADoaYGAuNhKia+B+AZwfSB9IBj9ABi465D9ABj9ABgBaY+QwQgHxT9S3UqYmiz4BPAQwQgLxqKM3UsYoiIB+AVwGsEILK+D3l1JrPgF8C+CQgf5eEAgEgBQ0CASAGCAH1UD0z/6APpAcCKAVQH6RDBYuvL07UTQ+gD6QPpA1DBRNqFSKscF8uLBKML/8uLCVDRCcFQgE1QUA8hQBPoCWM8WAc8WzMkiyMsBEvQA9ADLAMkg+QBwdMjLAsoHy//J0AT6QPQEMfoAINdJwgDy4sR3gBjIywVQCM8WcIBwCs+gIXy2sTzIIQF41FGcjLHxnLP1AH+gIizxZQBs8WJfoCUAPPFslQBcwjkXKRceJQCKgToIIJycOAoBS88uLFBMmAQPsAECPIUAT6AljPFgHPFszJ7VQCASAJDAL3O1E0PoA+kD6QNQwCNM/+gBRUaAF+kD6QFNbxwVUc21wVCATVBQDyFAE+gJYzxYBzxbMySLIywES9AD0AMsAyfkAcHTIywLKB8v/ydBQDccFHLHy4sMK+gBRqKGCCJiWgGa2CKGCCJiWgKAYoSeXEEkQODdfBOMNJdcLAYAoLAHBSeaAYoYIQc2LQnMjLH1Iwyz9Y+gJQB88WUAfPFslxgBjIywUkzxZQBvoCFctqFMzJcfsAECQQIwB8wwAjwgCwjiGCENUydttwgBDIywVQCM8WUAT6AhbLahLLHxLLP8ly+wCTNWwh4gPIUAT6AljPFgHPFszJ7VQA1ztRND6APpA+kDUMAfTP/oA+kAwUVGhUknHBfLiwSfC//LiwgWCCTEtAKAWvPLiw4IQe92X3sjLHxXLP1AD+gIizxYBzxbJcYAYyMsFJM8WcPoCy2rMyYBA+wBAE8hQBPoCWM8WAc8WzMntVIACB1AEGuQ9qJofQB9IH0gahgCaY+QwQgLxqKM3QFBCD3uy+9dCVj5cWLpn5j9ABgJ0CgR5CgCfQEsZ4sA54tmZPaqQAG6D2BdqJofQB9IH0gahhq3vDTA==',
                ),
              ),
              Cell.oneFromBoc(
                base64ToBytes(
                  'te6ccsECDAEAAo0AAAAADQASAGkA5wFGAckB4QIBAhcCUQJpART/APSkE/S88sgLAQIBYgILA6TQIMcAkl8E4AHQ0wPtRND6QAH4YfpAAfhi+gAB+GP6ADD4ZAFxsJJfBOD6QDBwIYBVAfpEMFi68vQB0x/TP/hCUkDHBeMC+EFSQMcF4wI0NEMTAwQJAfYzVSFsIQKCED6+VDG6juUB+gD6APoAMPhDUAOg+GP4RAGg+GT4Q4ED6Lz4RIED6LywUhCwjqeCEFbf64rIyx8Syz/4Q/oC+ET6AvhBzxYB+gL4QgHJ2zxw+GNw+GSRW+LI+EHPFvhCzxb4Q/oC+ET6AsntVJVbhA/y8OIKArYzVSExI4IQC/P0R7qOyxAjXwP4Q8IA+ETCALHy4FCCEIlEakLIyx/LP/hD+gL4RPoC+EHPFnD4QgLJEoBA2zxw+GNw+GTI+EHPFvhCzxb4Q/oC+ET6AsntVOMOBgUC/iOCEEz4KAO6juoxbBL6APoA+gAwIoED6LwigQPovLBSELDy4FH4QyOh+GP4RCKh+GT4Q8L/+ETC/7Dy4FCCEFbf64rIyx8Uyz9Y+gIB+gL4Qc8WAfoCcPhCAskSgEDbPMj4Qc8W+ELPFvhD+gL4RPoCye1U4DAxAYIQQqD7Q7oGBwAscYAYyMsFUATPFlAE+gISy2rMyQH7AAE6jpUgggiYloC88uBTggiYloCh+EFw2zzgMIQP8vAIAChwgBjIywVQA88WUAP6AstqyQH7AAFuMHB0+wICghAdQ5rguo6fghAdQ5rgyMsfyz/4Qc8W+ELPFvhD+gL4RPoCyds8f5JbcOLchA/y8AoALHGAGMjLBVADzxZw+gISy2rMyYMG+wAAQ6G6bdqJofSAA/DD9IAD8MX0AAPwx/QAYfDJ8IPwhfCH8InFhJmX',
                ),
              ),
            ]),
        },
      });
      const revision = new RouterRevisionV1();

      const data = await revision.getData(router);

      expect(router.provider.call2).toBeCalledTimes(1);
      expect(router.provider.call2).toBeCalledWith(
        ROUTER_ADDRESS_STR,
        'get_router_data',
        [],
      );

      expect(data.isLocked).toBe(false);
      expect(data.adminAddress?.toString()).toMatchInlineSnapshot(
        '"0:499bbc12fb933d4a6277c4b3028fc3a5f8928b8a41838fe19f0f02f5ffa6fb70"',
      );
      expect(
        bytesToBase64(await data.tempUpgrade.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAgEAFgAAFAEhAAAAAAAAAAAAAAAAAAAAACABAAAAkbB8"',
      );
      expect(bytesToBase64(await data.poolCode.toBoc())).toMatchInlineSnapshot(
        '"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"',
      );
      expect(
        bytesToBase64(await data.jettonLpWalletCode.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsECDwEAAxUAAAAADQASABcAdQB6AH8A/QFVAVoB2gIUAlQCwgMFART/APSkE/S88sgLAQIBYgIOAgLMAwQAt9kGOASS+CcADoaYGAuNhKia+B+AZwfSB9IBj9ABi465D9ABj9ABgBaY+QwQgHxT9S3UqYmiz4BPAQwQgLxqKM3UsYoiIB+AVwGsEILK+D3l1JrPgF8C+CQgf5eEAgEgBQ0CASAGCAH1UD0z/6APpAcCKAVQH6RDBYuvL07UTQ+gD6QPpA1DBRNqFSKscF8uLBKML/8uLCVDRCcFQgE1QUA8hQBPoCWM8WAc8WzMkiyMsBEvQA9ADLAMkg+QBwdMjLAsoHy//J0AT6QPQEMfoAINdJwgDy4sR3gBjIywVQCM8WcIBwCs+gIXy2sTzIIQF41FGcjLHxnLP1AH+gIizxZQBs8WJfoCUAPPFslQBcwjkXKRceJQCKgToIIJycOAoBS88uLFBMmAQPsAECPIUAT6AljPFgHPFszJ7VQCASAJDAL3O1E0PoA+kD6QNQwCNM/+gBRUaAF+kD6QFNbxwVUc21wVCATVBQDyFAE+gJYzxYBzxbMySLIywES9AD0AMsAyfkAcHTIywLKB8v/ydBQDccFHLHy4sMK+gBRqKGCCJiWgGa2CKGCCJiWgKAYoSeXEEkQODdfBOMNJdcLAYAoLAHBSeaAYoYIQc2LQnMjLH1Iwyz9Y+gJQB88WUAfPFslxgBjIywUkzxZQBvoCFctqFMzJcfsAECQQIwB8wwAjwgCwjiGCENUydttwgBDIywVQCM8WUAT6AhbLahLLHxLLP8ly+wCTNWwh4gPIUAT6AljPFgHPFszJ7VQA1ztRND6APpA+kDUMAfTP/oA+kAwUVGhUknHBfLiwSfC//LiwgWCCTEtAKAWvPLiw4IQe92X3sjLHxXLP1AD+gIizxYBzxbJcYAYyMsFJM8WcPoCy2rMyYBA+wBAE8hQBPoCWM8WAc8WzMntVIACB1AEGuQ9qJofQB9IH0gahgCaY+QwQgLxqKM3QFBCD3uy+9dCVj5cWLpn5j9ABgJ0CgR5CgCfQEsZ4sA54tmZPaqQAG6D2BdqJofQB9IH0gahhq3vDTA=="',
      );
      expect(
        bytesToBase64(await data.lpAccountCode.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsECDAEAAo0AAAAADQASAGkA5wFGAckB4QIBAhcCUQJpART/APSkE/S88sgLAQIBYgILA6TQIMcAkl8E4AHQ0wPtRND6QAH4YfpAAfhi+gAB+GP6ADD4ZAFxsJJfBOD6QDBwIYBVAfpEMFi68vQB0x/TP/hCUkDHBeMC+EFSQMcF4wI0NEMTAwQJAfYzVSFsIQKCED6+VDG6juUB+gD6APoAMPhDUAOg+GP4RAGg+GT4Q4ED6Lz4RIED6LywUhCwjqeCEFbf64rIyx8Syz/4Q/oC+ET6AvhBzxYB+gL4QgHJ2zxw+GNw+GSRW+LI+EHPFvhCzxb4Q/oC+ET6AsntVJVbhA/y8OIKArYzVSExI4IQC/P0R7qOyxAjXwP4Q8IA+ETCALHy4FCCEIlEakLIyx/LP/hD+gL4RPoC+EHPFnD4QgLJEoBA2zxw+GNw+GTI+EHPFvhCzxb4Q/oC+ET6AsntVOMOBgUC/iOCEEz4KAO6juoxbBL6APoA+gAwIoED6LwigQPovLBSELDy4FH4QyOh+GP4RCKh+GT4Q8L/+ETC/7Dy4FCCEFbf64rIyx8Uyz9Y+gIB+gL4Qc8WAfoCcPhCAskSgEDbPMj4Qc8W+ELPFvhD+gL4RPoCye1U4DAxAYIQQqD7Q7oGBwAscYAYyMsFUATPFlAE+gISy2rMyQH7AAE6jpUgggiYloC88uBTggiYloCh+EFw2zzgMIQP8vAIAChwgBjIywVQA88WUAP6AstqyQH7AAFuMHB0+wICghAdQ5rguo6fghAdQ5rgyMsfyz/4Qc8W+ELPFvhD+gL4RPoCyds8f5JbcOLchA/y8AoALHGAGMjLBVADzxZw+gISy2rMyYMG+wAAQ6G6bdqJofSAA/DD9IAD8MX0AAPwx/QAYfDJ8IPwhfCH8InFhJmX"',
      );
    });
  });

  describe('constructPoolRevision', () => {
    it('should return RouterRevisionV1 instance', () => {
      const revision = new RouterRevisionV1();

      expect(revision.constructPoolRevision(ROUTER)).toBeInstanceOf(
        PoolRevisionV1,
      );
    });
  });
});
