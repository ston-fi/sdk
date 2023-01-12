import TonWeb from 'tonweb';
import { describe, it, expect, vi } from 'vitest';

import type { LpAccount } from '@/contracts/lp-account/LpAccount';

import { LpAccountRevisionV1 } from './LpAccountRevisionV1';

const {
  utils: { BN, bytesToBase64 },
  boc: { Cell },
  Address,
} = TonWeb;

describe('LpAccountRevisionV1', () => {
  describe('createRefundBody', () => {
    it('should create body with expected content', async () => {
      const revision = new LpAccountRevisionV1();

      const body = await revision.createRefundBody({} as LpAccount, {
        queryId: new BN(123456789),
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgL8/RHAAAAAAdbzRW5B552"',
      );
    });
  });

  describe('createDirectAddLiquidityBody', () => {
    it('should create body with expected content', async () => {
      const revision = new LpAccountRevisionV1();

      const body = await revision.createDirectAddLiquidityBody(
        {} as LpAccount,
        {
          amount0: new BN(1000000000),
          amount1: new BN(2000000000),
          miniumLpToMint: new BN(300),
          queryId: new BN(123456789),
        },
      );

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAGgAAAC9M+CgDAAAAAAdbzRVDuaygBHc1lAAgEsgf57J7"',
      );
    });
  });

  describe('createResetGasBody', () => {
    it('should create body with expected content', async () => {
      const revision = new LpAccountRevisionV1();

      const body = await revision.createResetGasBody({} as LpAccount, {
        queryId: new BN(123456789),
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABhCoPtDAAAAAAdbzRWekgTc"',
      );
    });
  });
});
