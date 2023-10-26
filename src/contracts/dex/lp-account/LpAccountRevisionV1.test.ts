import TonWeb from 'tonweb';
import { describe, it, expect, vi } from 'vitest';

import { createMockObj } from '@/tests/utils';

import type { LpAccount } from './LpAccount';
import { LpAccountRevisionV1 } from './LpAccountRevisionV1';

const {
  utils: { BN, bytesToBase64, base64ToBytes },
  boc: { Cell },
  Address,
} = TonWeb;

const LP_ACCOUNT = createMockObj<LpAccount>({});

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
    it('should create body with expected content when minimumLpToMint is defined', async () => {
      const revision = new LpAccountRevisionV1();

      const body = await revision.createDirectAddLiquidityBody(LP_ACCOUNT, {
        amount0: new BN(1000000000),
        amount1: new BN(2000000000),
        minimumLpToMint: new BN(300),
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAGgAAAC9M+CgDAAAAAAAAAABDuaygBHc1lAAgEsggFqZK"',
      );
    });
    it('should create body with expected content when queryId & minimumLpToMint is defined', async () => {
      const revision = new LpAccountRevisionV1();

      const body = await revision.createDirectAddLiquidityBody(LP_ACCOUNT, {
        amount0: new BN(1000000000),
        amount1: new BN(2000000000),
        minimumLpToMint: new BN(300),
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

  describe('getData', () => {
    it('should return expected data about the lp account', async () => {
      const lpAccount = createMockObj<LpAccount>({
        ...LP_ACCOUNT,
        getAddress: vi
          .fn()
          .mockResolvedValue(
            new Address('EQBY3SPD7y8OR6q6Q45-EcarZGHHPEBAuzd3KiMseftIvGde'),
          ),
        provider: {
          call2: vi
            .fn()
            .mockResolvedValue([
              Cell.oneFromBoc(
                base64ToBytes(
                  'te6ccsEBAQEAJAAAAEOAAhPiXVKvsD1hxGhnnmesB49ksyqyDn0xoH/5PQAiWc0QY+4g6g==',
                ),
              ),
              Cell.oneFromBoc(
                base64ToBytes(
                  'te6ccsEBAQEAJAAAAEOADy02izzyOrkjKF3nUrsBqD2y8SQqMfrzmtLQzf1sg9zw4sVFIQ==',
                ),
              ),
              new BN(0),
              new BN(1001000),
            ]),
        },
      });

      const revision = new LpAccountRevisionV1();

      const data = await revision.getData(lpAccount);

      expect(data.userAddress?.toString()).toBe(
        '0:109f12ea957d81eb0e23433cf33d603c7b2599559073e98d03ffc9e80112ce68',
      );
      expect(data.poolAddress?.toString()).toBe(
        '0:7969b459e791d5c91942ef3a95d80d41ed978921518fd79cd696866feb641ee7',
      );
      expect(data.amount0?.toString()).toBe('0');
      expect(data.amount1?.toString()).toBe('1001000');
    });
  });
});
