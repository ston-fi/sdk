import TonWeb from 'tonweb';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { createMockObj } from '@/tests/utils';
import { LpAccount } from '../lp-account/LpAccount';

import { Pool } from './Pool';
import type { PoolRevision } from './PoolRevision';

const {
  Address,
  boc: { Cell },
  utils: { BN, bytesToBase64 },
  token: {
    jetton: { JettonWallet },
  },
} = TonWeb;

const PROVIDER = createMockObj<Pool['provider']>();
const POOL_ADDRESS = 'EQAp3YxqaE1WhyUeHa0-7PGjjxXZdPy47d8wCdRPOHwB-Oaa';
const POOL_REVISION = createMockObj<PoolRevision>({
  gasConstants: {
    collectFees: new BN(1),
    burn: new BN(2),
  },
  createCollectFeesBody: vi.fn(() => {
    const cell = new Cell();
    cell.bits.writeString('createCollectFeesBody');

    return cell;
  }),
  createBurnBody: vi.fn(() => {
    const cell = new Cell();
    cell.bits.writeString('createBurnBody');

    return cell;
  }),
  getExpectedOutputs: vi.fn(() => ({
    jettonToReceive: new BN(1),
    protocolFeePaid: new BN(2),
    refFeePaid: new BN(3),
  })),
  getExpectedTokens: vi.fn(() => new BN(3)),
  getExpectedLiquidity: vi.fn(() => ({
    amount0: new BN(1),
    amount1: new BN(2),
  })),
  getLpAccountAddress: vi.fn(
    () => new Address('EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv'),
  ),
  getData: vi.fn(() => ({
    reserve0: new BN(1),
    reserve1: new BN(2),
    token0WalletAddress: new Address(
      '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
    ),
    token1WalletAddress: new Address(
      '0:b90a4147ba83fea581fa8d73b1c92cf82dcc92b0c6df924c3c0553d713b35e6c',
    ),
    lpFee: new BN(3),
    protocolFee: new BN(4),
    refFee: new BN(5),
    protocolFeeAddress: null,
    collectedToken0ProtocolFee: new BN(6),
    collectedToken1ProtocolFee: new BN(7),
  })),
  constructLpAccountRevision: vi.fn(() => createMockObj<LpAccount>()),
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Pool', () => {
  describe('constructor', () => {
    it('should build pool with a custom revision class', () => {
      const revision = createMockObj<PoolRevision>({});
      const pool = new Pool(
        PROVIDER,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision,
          address: POOL_ADDRESS,
        },
      );

      expect(pool).toBeInstanceOf(Pool);
    });
    it('should build pool with a specific string revision', () => {
      const pool = new Pool(
        PROVIDER,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision: 'V1',
          address: POOL_ADDRESS,
        },
      );

      expect(pool).toBeInstanceOf(Pool);
    });
    it('should throw if unknown string revision is provided', () => {
      expect(
        () =>
          new Pool(
            PROVIDER,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            {
              revision: 'unknown' as any,
              address: POOL_ADDRESS,
            },
          ),
      ).toThrow();
    });
  });

  describe('gasConstants', () => {
    it('should return gas constants from revision', () => {
      const pool = new Pool(
        PROVIDER,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision: POOL_REVISION,
          address: POOL_ADDRESS,
        },
      );

      expect(pool.gasConstants).toBe(POOL_REVISION.gasConstants);
    });
  });

  describe('createCollectFeesBody', () => {
    it('should call revision.createCollectFeesBody with all params and return expected result', async () => {
      const pool = new Pool(
        PROVIDER,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision: POOL_REVISION,
          address: POOL_ADDRESS,
        },
      );

      const params: Parameters<
        InstanceType<typeof Pool>['createCollectFeesBody']
      > = [
        {
          queryId: 12345,
        },
      ];
      const body = await pool.createCollectFeesBody(...params);

      expect(POOL_REVISION.createCollectFeesBody).toBeCalledTimes(1);
      expect(POOL_REVISION.createCollectFeesBody).toBeCalledWith(
        pool,
        ...params,
      );

      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAFwAAACpjcmVhdGVDb2xsZWN0RmVlc0JvZHkhF9zp"',
      );
    });
  });

  describe('createBurnBody', () => {
    it('should call revision.createBurnBody with all params and return expected result', async () => {
      const pool = new Pool(
        PROVIDER,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision: POOL_REVISION,
          address: POOL_ADDRESS,
        },
      );

      const params: Parameters<InstanceType<typeof Pool>['createBurnBody']> = [
        {
          amount: new BN(1),
          responseAddress: POOL_ADDRESS,
          queryId: 12345,
        },
      ];
      const body = await pool.createBurnBody(...params);

      expect(POOL_REVISION.createBurnBody).toBeCalledTimes(1);
      expect(POOL_REVISION.createBurnBody).toBeCalledWith(pool, ...params);

      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEAAAABxjcmVhdGVCdXJuQm9keblT5zQ="',
      );
    });
  });

  describe('getExpectedOutputs', () => {
    it('should call revision.getExpectedOutputs with all params and return expected result', async () => {
      const pool = new Pool(
        PROVIDER,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision: POOL_REVISION,
          address: POOL_ADDRESS,
        },
      );

      const params: Parameters<
        InstanceType<typeof Pool>['getExpectedOutputs']
      > = [
        {
          amount: new BN(1),
          jettonWallet: POOL_ADDRESS,
        },
      ];
      const body = await pool.getExpectedOutputs(...params);

      expect(POOL_REVISION.getExpectedOutputs).toBeCalledTimes(1);
      expect(POOL_REVISION.getExpectedOutputs).toBeCalledWith(pool, ...params);

      expect(body.jettonToReceive).toStrictEqual(new BN(1));
      expect(body.protocolFeePaid).toStrictEqual(new BN(2));
      expect(body.refFeePaid).toStrictEqual(new BN(3));
    });
  });

  describe('getExpectedTokens', () => {
    it('should call revision.getExpectedTokens with all params and return expected result', async () => {
      const pool = new Pool(
        PROVIDER,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision: POOL_REVISION,
          address: POOL_ADDRESS,
        },
      );

      const params: Parameters<InstanceType<typeof Pool>['getExpectedTokens']> =
        [
          {
            amount0: new BN(1),
            amount1: new BN(2),
          },
        ];
      const body = await pool.getExpectedTokens(...params);

      expect(POOL_REVISION.getExpectedTokens).toBeCalledTimes(1);
      expect(POOL_REVISION.getExpectedTokens).toBeCalledWith(pool, ...params);

      expect(body).toStrictEqual(new BN(3));
    });
  });

  describe('getExpectedLiquidity', () => {
    it('should call revision.getExpectedLiquidity with all params and return expected result', async () => {
      const pool = new Pool(
        PROVIDER,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision: POOL_REVISION,
          address: POOL_ADDRESS,
        },
      );

      const params: Parameters<
        InstanceType<typeof Pool>['getExpectedLiquidity']
      > = [
        {
          jettonAmount: new BN(3),
        },
      ];

      const body = await pool.getExpectedLiquidity(...params);

      expect(POOL_REVISION.getExpectedLiquidity).toBeCalledTimes(1);
      expect(POOL_REVISION.getExpectedLiquidity).toBeCalledWith(
        pool,
        ...params,
      );

      expect(body.amount0).toStrictEqual(new BN(1));
      expect(body.amount1).toStrictEqual(new BN(2));
    });
  });

  describe('getJettonWallet', () => {
    it('should return JettonWallet address for a given address', async () => {
      const provider = createMockObj<Pool['provider']>({
        ...PROVIDER,
        call2: vi.fn(() => {
          const cell = new Cell();
          cell.bits.writeAddress(
            new Address(
              '0:565a1b3b8098eb0bffe6286eb115fd6fab84a38b742a638bb4ef603b4665b152',
            ),
          );

          return cell;
        }),
      });

      const pool = new Pool(
        provider,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision: POOL_REVISION,
          address: POOL_ADDRESS,
        },
      );

      const jettonWallet = await pool.getJettonWallet({
        ownerAddress: 'EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i',
      });

      expect(jettonWallet).toBeInstanceOf(JettonWallet);
      expect(jettonWallet.address).toStrictEqual(
        new Address(
          '0:565a1b3b8098eb0bffe6286eb115fd6fab84a38b742a638bb4ef603b4665b152',
        ),
      );
    });
  });

  describe('getLpAccountAddress', () => {
    it('should call revision.getLpAccountAddress with all params and return expected result', async () => {
      const pool = new Pool(
        PROVIDER,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision: POOL_REVISION,
          address: POOL_ADDRESS,
        },
      );

      const params: Parameters<
        InstanceType<typeof Pool>['getLpAccountAddress']
      > = [
        {
          ownerAddress: 'EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i',
        },
      ];

      const address = await pool.getLpAccountAddress(...params);

      expect(POOL_REVISION.getLpAccountAddress).toBeCalledTimes(1);
      expect(POOL_REVISION.getLpAccountAddress).toBeCalledWith(pool, ...params);

      expect(address).toStrictEqual(
        new Address('EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv'),
      );
    });
    it('should return null if revision.getLpAccountAddress returns null', async () => {
      const revision = createMockObj<PoolRevision>({
        ...POOL_REVISION,
        getLpAccountAddress: vi.fn(() => null),
      });

      const pool = new Pool(
        PROVIDER,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision,
          address: POOL_ADDRESS,
        },
      );

      const params: Parameters<
        InstanceType<typeof Pool>['getLpAccountAddress']
      > = [
        {
          ownerAddress: 'EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i',
        },
      ];

      const address = await pool.getLpAccountAddress(...params);

      expect(revision.getLpAccountAddress).toBeCalledTimes(1);
      expect(revision.getLpAccountAddress).toBeCalledWith(pool, ...params);

      expect(address).toBeNull();
    });
  });

  describe('getLpAccount', () => {
    it('should return LpAccount class with the address received by calling getLpAccountAddress', async () => {
      const pool = new Pool(
        PROVIDER,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision: POOL_REVISION,
          address: POOL_ADDRESS,
        },
      );

      const params: Parameters<InstanceType<typeof Pool>['getLpAccount']> = [
        {
          ownerAddress: 'EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i',
        },
      ];

      const lpAccount = await pool.getLpAccount(...params);

      expect(POOL_REVISION.getLpAccountAddress).toBeCalledTimes(1);
      expect(POOL_REVISION.getLpAccountAddress).toBeCalledWith(pool, ...params);

      expect(lpAccount).toBeInstanceOf(LpAccount);
      expect(lpAccount?.address).toStrictEqual(
        new Address('EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv'),
      );
    });
    it('should return null if revision.getLpAccountAddress returns null', async () => {
      const revision = createMockObj<PoolRevision>({
        ...POOL_REVISION,
        getLpAccountAddress: vi.fn(() => null),
      });

      const pool = new Pool(
        PROVIDER,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision,
          address: POOL_ADDRESS,
        },
      );

      const params: Parameters<InstanceType<typeof Pool>['getLpAccount']> = [
        {
          ownerAddress: 'EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i',
        },
      ];

      const lpAccount = await pool.getLpAccount(...params);

      expect(revision.getLpAccountAddress).toBeCalledTimes(1);
      expect(revision.getLpAccountAddress).toBeCalledWith(pool, ...params);

      expect(lpAccount).toBeNull();
    });
  });

  describe('getData', () => {
    it('should call revision.getData & return it result', async () => {
      const pool = new Pool(
        PROVIDER,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          address: POOL_ADDRESS,
          revision: POOL_REVISION,
        },
      );

      const data = await pool.getData();

      expect(POOL_REVISION.getData).toBeCalledTimes(1);
      expect(POOL_REVISION.getData).toBeCalledWith(pool);

      expect(data).toEqual({
        reserve0: new BN(1),
        reserve1: new BN(2),
        token0WalletAddress: new Address(
          '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
        ),
        token1WalletAddress: new Address(
          '0:b90a4147ba83fea581fa8d73b1c92cf82dcc92b0c6df924c3c0553d713b35e6c',
        ),
        lpFee: new BN(3),
        protocolFee: new BN(4),
        refFee: new BN(5),
        protocolFeeAddress: null,
        collectedToken0ProtocolFee: new BN(6),
        collectedToken1ProtocolFee: new BN(7),
      });
    });
  });

  describe('buildCollectFeeTxParams', () => {
    it('should build expected params by using createCollectFeesBody method', async () => {
      const pool = new Pool(
        PROVIDER,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision: POOL_REVISION,
          address: POOL_ADDRESS,
        },
      );

      const params = await pool.buildCollectFeeTxParams();

      expect(POOL_REVISION.createCollectFeesBody).toBeCalledTimes(1);
      expect(POOL_REVISION.createCollectFeesBody).toBeCalledWith(
        pool,
        expect.objectContaining({}),
      );

      expect(params.to).toStrictEqual(new Address(POOL_ADDRESS));
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAFwAAACpjcmVhdGVDb2xsZWN0RmVlc0JvZHkhF9zp"',
      );
      expect(params.gasAmount).toEqual(POOL_REVISION.gasConstants.collectFees);
    });
    it('should build expected params when gasAmount is defined', async () => {
      const pool = new Pool(
        PROVIDER,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision: POOL_REVISION,
          address: POOL_ADDRESS,
        },
      );

      const gasAmount = new BN(12345);
      const params = await pool.buildCollectFeeTxParams({ gasAmount });

      expect(POOL_REVISION.createCollectFeesBody).toBeCalledTimes(1);
      expect(POOL_REVISION.createCollectFeesBody).toBeCalledWith(
        pool,
        expect.objectContaining({}),
      );

      expect(params.to).toStrictEqual(new Address(POOL_ADDRESS));
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAFwAAACpjcmVhdGVDb2xsZWN0RmVlc0JvZHkhF9zp"',
      );
      expect(params.gasAmount).toBe(gasAmount);
    });
    it('should build expected params when queryId is defined', async () => {
      const pool = new Pool(
        PROVIDER,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision: POOL_REVISION,
          address: POOL_ADDRESS,
        },
      );

      const queryId = 12345;
      const params = await pool.buildCollectFeeTxParams({ queryId });

      expect(POOL_REVISION.createCollectFeesBody).toBeCalledTimes(1);
      expect(POOL_REVISION.createCollectFeesBody).toBeCalledWith(
        pool,
        expect.objectContaining({
          queryId,
        }),
      );

      expect(params.to).toStrictEqual(new Address(POOL_ADDRESS));
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAFwAAACpjcmVhdGVDb2xsZWN0RmVlc0JvZHkhF9zp"',
      );
      expect(params.gasAmount).toEqual(POOL_REVISION.gasConstants.collectFees);
    });
  });

  describe('buildBurnTxParams', () => {
    const amount = new BN(1);
    const responseAddress = 'EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i';

    const provider = createMockObj<Pool['provider']>({
      ...PROVIDER,
      call2: vi.fn(() => {
        const cell = new Cell();
        cell.bits.writeAddress(
          new Address(
            '0:565a1b3b8098eb0bffe6286eb115fd6fab84a38b742a638bb4ef603b4665b152',
          ),
        );

        return cell;
      }),
    });

    it('should build expected params by using createBurnBody method', async () => {
      const pool = new Pool(
        provider,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision: POOL_REVISION,
          address: POOL_ADDRESS,
        },
      );

      const params = await pool.buildBurnTxParams({
        amount,
        responseAddress,
      });

      expect(POOL_REVISION.createBurnBody).toBeCalledTimes(1);
      expect(POOL_REVISION.createBurnBody).toBeCalledWith(
        pool,
        expect.objectContaining({
          amount,
          responseAddress,
        }),
      );

      expect(params.to).toStrictEqual(
        new Address(
          '0:565a1b3b8098eb0bffe6286eb115fd6fab84a38b742a638bb4ef603b4665b152',
        ),
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEAAAABxjcmVhdGVCdXJuQm9keblT5zQ="',
      );
      expect(params.gasAmount).toEqual(POOL_REVISION.gasConstants.burn);
    });
    it('should build expected params when gasAmount is defined', async () => {
      const pool = new Pool(
        provider,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision: POOL_REVISION,
          address: POOL_ADDRESS,
        },
      );

      const gasAmount = new BN(12345);
      const params = await pool.buildBurnTxParams({
        amount,
        responseAddress,
        gasAmount,
      });

      expect(POOL_REVISION.createBurnBody).toBeCalledTimes(1);
      expect(POOL_REVISION.createBurnBody).toBeCalledWith(
        pool,
        expect.objectContaining({}),
      );

      expect(params.to).toStrictEqual(
        new Address(
          '0:565a1b3b8098eb0bffe6286eb115fd6fab84a38b742a638bb4ef603b4665b152',
        ),
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEAAAABxjcmVhdGVCdXJuQm9keblT5zQ="',
      );
      expect(params.gasAmount).toBe(gasAmount);
    });
    it('should build expected params when queryId is defined', async () => {
      const pool = new Pool(
        provider,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          revision: POOL_REVISION,
          address: POOL_ADDRESS,
        },
      );

      const queryId = 12345;
      const params = await pool.buildBurnTxParams({
        amount,
        responseAddress,
        queryId,
      });

      expect(POOL_REVISION.createBurnBody).toBeCalledTimes(1);
      expect(POOL_REVISION.createBurnBody).toBeCalledWith(
        pool,
        expect.objectContaining({
          queryId,
        }),
      );

      expect(params.to).toStrictEqual(
        new Address(
          '0:565a1b3b8098eb0bffe6286eb115fd6fab84a38b742a638bb4ef603b4665b152',
        ),
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEAAAABxjcmVhdGVCdXJuQm9keblT5zQ="',
      );
      expect(params.gasAmount).toEqual(POOL_REVISION.gasConstants.burn);
    });
  });
});
