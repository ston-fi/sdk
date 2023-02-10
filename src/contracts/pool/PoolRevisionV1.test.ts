import TonWeb from 'tonweb';
import { describe, it, expect } from 'vitest';

import { LpAccountRevisionV1 } from '@/contracts/lp-account/LpAccountRevisionV1';
import type { Pool } from '@/contracts/pool/Pool';

import { PoolRevisionV1 } from './PoolRevisionV1';

const {
  utils: { BN, bytesToBase64 },
  boc: { Cell },
} = TonWeb;

const POOL = {} as unknown as Pool;

describe('PoolRevisionV1', () => {
  describe('gasConstants', () => {
    it('should return expected gas constants', () => {
      const { gasConstants } = new PoolRevisionV1();

      expect(gasConstants.collectFees.toString()).toBe('1100000000');
      expect(gasConstants.burn.toString()).toBe('500000000');
    });
  });

  describe('createCollectFeesBody', () => {
    it('should create body with expected content', async () => {
      const revision = new PoolRevisionV1();

      const body = await revision.createCollectFeesBody(POOL, {});

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgfy309AAAAAAAAAAA6Ha+R"',
      );
    });
    it('should create body with expected content when queryId is defined', async () => {
      const revision = new PoolRevisionV1();

      const body = await revision.createCollectFeesBody(POOL, {
        queryId: 123456789,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEADgAAABgfy309AAAAAAdbzRWIc1AM"',
      );
    });
  });

  describe('createBurnBody', () => {
    it('should create body with expected content', async () => {
      const revision = new PoolRevisionV1();

      const body = await revision.createBurnBody(POOL, {
        amount: new BN(1000000000),
        responseAddress: 'EQDneJ03j4n9vWFwvuEZbt8o_UtoT2A1YPv46-97KXsvWsOZ',
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEANAAAAGNZXwe8AAAAAAAAAABDuaygCAHO8TpvHxP7esLhfcIy3b5R+pbQnsBqwffx1972UvZetdK0/c4="',
      );
    });
    it('should create body with expected content when queryId is defined', async () => {
      const revision = new PoolRevisionV1();

      const body = await revision.createBurnBody(POOL, {
        amount: new BN(1000000000),
        responseAddress: 'EQDneJ03j4n9vWFwvuEZbt8o_UtoT2A1YPv46-97KXsvWsOZ',
        queryId: 123456789,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEANAAAAGNZXwe8AAAAAAdbzRVDuaygCAHO8TpvHxP7esLhfcIy3b5R+pbQnsBqwffx1972UvZetXdC5iw="',
      );
    });
  });

  describe('constructLpAccountRevision', () => {
    it('should return LpAccountRevisionV1 instance', () => {
      const revision = new PoolRevisionV1();

      expect(revision.constructLpAccountRevision(POOL)).toBeInstanceOf(
        LpAccountRevisionV1,
      );
    });
  });
});
