import TonWeb from 'tonweb';
import { describe, it, expect } from 'vitest';

import type { Pool } from '@/contracts/pool/Pool';

import { PoolRevisionV1 } from './PoolRevisionV1';

const {
  utils: { BN, bytesToBase64 },
  boc: { Cell },
  Address,
} = TonWeb;

describe('PoolRevisionV1', () => {
  describe('createCollectFeesBody', () => {
    it('should create body with expected content', async () => {
      const revision = new PoolRevisionV1();

      const body = await revision.createCollectFeesBody({} as Pool, {
        queryId: new BN(123456789),
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

      const body = await revision.createBurnBody({} as Pool, {
        amount: new BN(1000000000),
        responseAddress: new Address(
          'EQDneJ03j4n9vWFwvuEZbt8o_UtoT2A1YPv46-97KXsvWsOZ',
        ),
        queryId: new BN(123456789),
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEANAAAAGNZXwe8AAAAAAdbzRVDuaygCAHO8TpvHxP7esLhfcIy3b5R+pbQnsBqwffx1972UvZetXdC5iw="',
      );
    });
  });
});
