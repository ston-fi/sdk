import TonWeb from 'tonweb';
import { describe, it, expect, vi } from 'vitest';

import type { Router } from '@/contracts/router/Router';

import { RouterRevisionV1 } from './RouterRevisionV1';

const {
  utils: { BN, bytesToBase64 },
  boc: { Cell },
  Address,
} = TonWeb;

describe('RouterRevisionV1', () => {
  describe('createSwapBody', () => {
    it('should create body with expected content', async () => {
      const revision = new RouterRevisionV1();

      const body = await revision.createSwapBody(
        {
          getAddress: vi.fn(
            () =>
              new Address('EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt'),
          ),
        } as unknown as Router,
        {
          userWalletAddress: new Address(
            'EQDneJ03j4n9vWFwvuEZbt8o_UtoT2A1YPv46-97KXsvWsOZ',
          ),
          offerAmount: new BN(1000000000),
          minAskAmount: new BN(900000000),
          askJettonWalletAddress: new Address(
            'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi',
          ),
          forwardGasAmount: revision.gasConstants.swapForward.addn(1),
          queryId: new BN(123456789),
        },
      );

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAiAAAOgFtD4p+pQAAAAAHW80VQ7msoAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwQPy5RBwEAlyWThWGAF/qxQZ4iDFib7zLn3Q64LurXI5+b4a93AhF2A3bK9b+Ia0nSAQA53idN4+J/b1hcL7hGW7fKP1LaE9gNWD7+Ovveyl7L1pA8cWuM"',
      );
    });
  });

  describe('createProvideLiquidityBody', () => {
    it('should create body with expected content', async () => {
      const revision = new RouterRevisionV1();

      const body = await revision.createProvideLiquidityBody(
        {
          getAddress: vi.fn(
            () =>
              new Address('EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt'),
          ),
        } as unknown as Router,
        {
          routerWalletAddress: new Address(
            'EQDneJ03j4n9vWFwvuEZbt8o_UtoT2A1YPv46-97KXsvWsOZ',
          ),
          lpAmount: new BN(1000000000),
          minLpOut: new BN(900000000),
          forwardGasAmount: revision.gasConstants.provideLpForward.addn(1),
          queryId: new BN(123456789),
        },
      );

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAZgAAOgFtD4p+pQAAAAAHW80VQ7msoAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwQPy5RBwEAU/z55Y+AHO8TpvHxP7esLhfcIy3b5R+pbQnsBqwffx1972UvZetIa0nSAXmgp9k="',
      );
    });
  });
});
