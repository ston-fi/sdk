import TonWeb from 'tonweb';
import { describe, it, expect, vi } from 'vitest';

import { LpAccountRevisionV1 } from '@/contracts/lp-account/LpAccountRevisionV1';
import { createMockObj } from '@/test';

import type { Pool } from './Pool';
import { PoolRevisionV1 } from './PoolRevisionV1';

const {
  Address,
  utils: { BN, bytesToBase64, base64ToBytes },
  boc: { Cell },
} = TonWeb;

const POOL_ADDRESS = 'EQB5abRZ55HVyRlC7zqV2A1B7ZeJIVGP15zWloZv62Qe57pN';
const POOL = createMockObj<Pool>({
  getAddress: async () => POOL_ADDRESS,
});

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
        responseAddress: 'EQB3YmWW5ZLhe2gPUAw550e2doyWnkj5hzv3TXp2ekpAWe7v',
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEANAAAAGNZXwe8AAAAAAAAAABDuaygCADuxMstyyXC9tAeoBhzzo9s7RktPJHzDnfumvTs9JSAs37b/ns="',
      );
    });
    it('should create body with expected content when queryId is defined', async () => {
      const revision = new PoolRevisionV1();

      const body = await revision.createBurnBody(POOL, {
        amount: new BN(1000000000),
        responseAddress: 'EQB3YmWW5ZLhe2gPUAw550e2doyWnkj5hzv3TXp2ekpAWe7v',
        queryId: 123456789,
      });

      expect(body).toBeInstanceOf(Cell);
      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEANAAAAGNZXwe8AAAAAAdbzRVDuaygCADuxMstyyXC9tAeoBhzzo9s7RktPJHzDnfumvTs9JSAs9st5Zk="',
      );
    });
  });

  describe('getExpectedOutputs', () => {
    it('should return expected output', async () => {
      const pool = createMockObj<Pool>({
        ...POOL,
        provider: {
          call2: vi
            .fn()
            .mockImplementation(async () => [new BN(1), new BN(2), new BN(3)]),
        },
      });

      const revision = new PoolRevisionV1();

      const data = await revision.getExpectedOutputs(pool, {
        amount: new BN(1000000000),
        jettonWallet: 'EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i',
      });

      expect(data.jettonToReceive).toStrictEqual(new BN(1));
      expect(data.protocolFeePaid).toStrictEqual(new BN('2'));
      expect(data.refFeePaid).toStrictEqual(new BN('3'));
    });
  });

  describe('getExpectedTokens', () => {
    it('should return expected output', async () => {
      const pool = createMockObj<Pool>({
        ...POOL,
        provider: {
          call2: vi.fn().mockImplementation(async () => new BN(3)),
        },
      });

      const revision = new PoolRevisionV1();

      const data = await revision.getExpectedTokens(pool, {
        amount0: new BN(1),
        amount1: new BN(2),
      });

      expect(data).toStrictEqual(new BN(3));
    });
  });

  describe('getExpectedLiquidity', () => {
    it('should return expected output', async () => {
      const pool = createMockObj<Pool>({
        ...POOL,
        provider: {
          call2: vi.fn().mockImplementation(async () => [new BN(2), new BN(3)]),
        },
      });

      const revision = new PoolRevisionV1();

      const data = await revision.getExpectedLiquidity(pool, {
        jettonAmount: new BN(1),
      });

      expect(data.amount0).toStrictEqual(new BN(2));
      expect(data.amount1).toStrictEqual(new BN(3));
    });
  });

  describe('getLpAccountAddress', () => {
    it('should return expected output', async () => {
      const pool = createMockObj<Pool>({
        ...POOL,
        provider: {
          call2: vi
            .fn()
            .mockResolvedValue(
              Cell.oneFromBoc(
                base64ToBytes(
                  'te6ccsEBAQEAJAAAAEOACxukeH3l4cj1V0hxz8I41WyMOOeICBdm7uVEZY8/aReQ+BjK8Q==',
                ),
              ),
            ),
        },
      });

      const revision = new PoolRevisionV1();

      const data = await revision.getLpAccountAddress(pool, {
        ownerAddress: 'EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i',
      });

      expect(data).toStrictEqual(
        new Address(
          '0:58dd23c3ef2f0e47aaba438e7e11c6ab6461c73c4040bb37772a232c79fb48bc',
        ),
      );
    });
  });

  describe('getData', () => {
    it('should return expected data about the pool', async () => {
      const pool = createMockObj<Pool>({
        ...POOL,
        provider: {
          call2: vi
            .fn()
            .mockResolvedValue([
              new BN(1),
              new BN(2),
              Cell.oneFromBoc(
                base64ToBytes(
                  'te6ccsEBAQEAJAAAAEOAEBr+QXnubuDaQWw/f6J1raqz2EG9Q6Za3+pRAPWYRmHQKxShow==',
                ),
              ),
              Cell.oneFromBoc(
                base64ToBytes(
                  'te6ccsEBAQEAJAAAAEOAA3oGHZ3ugqTxEOaqdIXTrM3YY6q+L9xNE84nXBbSQIBww51v8g==',
                ),
              ),
              new BN(3),
              new BN(4),
              new BN(5),
              Cell.oneFromBoc(
                base64ToBytes(
                  'te6ccsEBAQEAJAAAAEOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQvWZ7LQ==',
                ),
              ),
              new BN(6),
              new BN(7),
            ]),
        },
      });

      const revision = new PoolRevisionV1();

      const data = await revision.getData(pool);

      expect(data.reserve0).toStrictEqual(new BN(1));
      expect(data.reserve1).toStrictEqual(new BN(2));
      expect(data.token0WalletAddress).toStrictEqual(
        new Address(
          '0:80d7f20bcf737706d20b61fbfd13ad6d559ec20dea1d32d6ff528807acc2330e',
        ),
      );
      expect(data.token1WalletAddress).toStrictEqual(
        new Address(
          '0:1bd030ecef74152788873553a42e9d666ec31d55f17ee2689e713ae0b6920403',
        ),
      );
      expect(data.lpFee).toStrictEqual(new BN(3));
      expect(data.protocolFee).toStrictEqual(new BN(4));
      expect(data.refFee).toStrictEqual(new BN(5));
      expect(data.protocolFeeAddress).toBeNull();
      expect(data.collectedToken0ProtocolFee).toStrictEqual(new BN(6));
      expect(data.collectedToken1ProtocolFee).toStrictEqual(new BN(7));
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
