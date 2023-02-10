import TonWeb from 'tonweb';
import { describe, it, expect, vi } from 'vitest';

import { ROUTER_REVISION_ADDRESS } from '@/constants';
import { Router } from '@/contracts/router/Router';
import { PoolRevisionV1 } from '@/contracts/pool/PoolRevisionV1';

import { RouterRevisionV1 } from './RouterRevisionV1';

const {
  utils: { BN, bytesToBase64 },
  boc: { Cell },
} = TonWeb;

const ROUTER = {
  getAddress: vi.fn(() => ROUTER_REVISION_ADDRESS.V1),
} as unknown as Router;

describe('RouterRevisionV1', () => {
  describe('gasConstants', () => {
    it('should return expected gas constants', () => {
      const { gasConstants } = new RouterRevisionV1();

      expect(gasConstants.swap.toString()).toBe('300000000');
      expect(gasConstants.provideLp.toString()).toBe('300000000');
      expect(gasConstants.swapForward.toString()).toBe('265000000');
      expect(gasConstants.provideLpForward.toString()).toBe('265000000');
    });
  });

  describe('createSwapBody', () => {
    it('should create body with expected content', async () => {
      const revision = new RouterRevisionV1();

      const body = await revision.createSwapBody(ROUTER, {
        userWalletAddress: 'EQDneJ03j4n9vWFwvuEZbt8o_UtoT2A1YPv46-97KXsvWsOZ',
        minAskAmount: new BN(900000000),
        askJettonWalletAddress:
          'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi',
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEATgAAAJclk4VhgBf6sUGeIgxYm+8y590OuC7q1yOfm+GvdwIRdgN2yvW/iGtJ0gEAOd4nTePif29YXC+4Rlu3yj9S2hPYDVg+/jr73spey9aQePYUuQ=="',
      );
    });
    it('should create body with expected content when referralAddress is defined', async () => {
      const revision = new RouterRevisionV1();

      const body = await revision.createSwapBody(ROUTER, {
        userWalletAddress: 'EQDneJ03j4n9vWFwvuEZbt8o_UtoT2A1YPv46-97KXsvWsOZ',
        minAskAmount: new BN(900000000),
        askJettonWalletAddress:
          'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi',
        referralAddress: 'EQCguqiHctoMqY28fFHWuXnY9XY-2ju1ZPBakEZa7f3Q7hr9',
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAbwAAANklk4VhgBf6sUGeIgxYm+8y590OuC7q1yOfm+GvdwIRdgN2yvW/iGtJ0gEAOd4nTePif29YXC+4Rlu3yj9S2hPYDVg+/jr73spey9awAoLqoh3LaDKmNvHxR1rl52PV2Pto7tWTwWpBGWu390O6ooQo8A=="',
      );
    });
  });

  describe('createProvideLiquidityBody', () => {
    it('should create body with expected content', async () => {
      const revision = new RouterRevisionV1();

      const body = await revision.createProvideLiquidityBody(ROUTER, {
        routerWalletAddress: 'EQDneJ03j4n9vWFwvuEZbt8o_UtoT2A1YPv46-97KXsvWsOZ',
        minLpOut: new BN(900000000),
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEALAAAAFP8+eWPgBzvE6bx8T+3rC4X3CMt2+UfqW0J7AasH38dfe9lL2XrSGtJ0gFKtmPm"',
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
