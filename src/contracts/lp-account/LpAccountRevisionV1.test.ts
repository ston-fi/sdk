import TonWeb from 'tonweb';
import { describe, it, expect } from 'vitest';

import type { LpAccount } from '@/contracts/lp-account/LpAccount';

import { LpAccountRevisionV1 } from './LpAccountRevisionV1';

const {
  utils: { BN, bytesToBase64 },
  boc: { Cell },
} = TonWeb;

const LP_ACCOUNT = {} as unknown as LpAccount;

describe('LpAccountRevisionV1', () => {
  describe('gasConstants', () => {
    it('should return expected gas constants', () => {
      const { gasConstants } = new LpAccountRevisionV1();

      expect(gasConstants.refund.toString()).toBe('500000000');
      expect(gasConstants.directAddLp.toString()).toBe('300000000');
      expect(gasConstants.resetGas.toString()).toBe('300000000');
    });
  });

  describe('createRefundBody', () => {
    it('should create body with expected content', async () => {
      const revision = new LpAccountRevisionV1();

      const body = await revision.createRefundBody(LP_ACCOUNT, {});

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgL8/RHAAAAAAAAAAALaWHr"',
      );
    });
    it('should create body with expected content when queryId is defined', async () => {
      const revision = new LpAccountRevisionV1();

      const body = await revision.createRefundBody(LP_ACCOUNT, {
        queryId: 123456789,
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

      const body = await revision.createDirectAddLiquidityBody(LP_ACCOUNT, {
        amount0: new BN(1000000000),
        amount1: new BN(2000000000),
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAGQAAAC1M+CgDAAAAAAAAAABDuaygBHc1lAAQGKuL7BM="',
      );
    });
    it('should create body with expected content when queryId is defined', async () => {
      const revision = new LpAccountRevisionV1();

      const body = await revision.createDirectAddLiquidityBody(LP_ACCOUNT, {
        amount0: new BN(1000000000),
        amount1: new BN(2000000000),
        queryId: 123456789,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAGQAAAC1M+CgDAAAAAAdbzRVDuaygBHc1lAAQGGpzuOE="',
      );
    });
    it('should create body with expected content when miniumLpToMint is defined', async () => {
      const revision = new LpAccountRevisionV1();

      const body = await revision.createDirectAddLiquidityBody(LP_ACCOUNT, {
        amount0: new BN(1000000000),
        amount1: new BN(2000000000),
        miniumLpToMint: new BN(300),
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAGgAAAC9M+CgDAAAAAAAAAABDuaygBHc1lAAgEsggFqZK"',
      );
    });
    it('should create body with expected content when queryId & miniumLpToMint is defined', async () => {
      const revision = new LpAccountRevisionV1();

      const body = await revision.createDirectAddLiquidityBody(LP_ACCOUNT, {
        amount0: new BN(1000000000),
        amount1: new BN(2000000000),
        miniumLpToMint: new BN(300),
        queryId: 123456789,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAGgAAAC9M+CgDAAAAAAdbzRVDuaygBHc1lAAgEsgf57J7"',
      );
    });
  });

  describe('createResetGasBody', () => {
    it('should create body with expected content', async () => {
      const revision = new LpAccountRevisionV1();

      const body = await revision.createResetGasBody(LP_ACCOUNT, {});

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABhCoPtDAAAAAAAAAAAs/PtB"',
      );
    });
    it('should create body with expected content when queryId is defined', async () => {
      const revision = new LpAccountRevisionV1();

      const body = await revision.createResetGasBody(LP_ACCOUNT, {
        queryId: 123456789,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABhCoPtDAAAAAAdbzRWekgTc"',
      );
    });
  });
});
