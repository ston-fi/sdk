import TonWeb from 'tonweb';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { createMockObj } from '@/tests/utils';
import { Pool } from '../pool/Pool';

import { Router } from './Router';
import type { RouterRevision } from './RouterRevision';

const {
  Address,
  boc: { Cell },
  utils: { BN, bytesToBase64, base64ToBytes },
} = TonWeb;

const TOKEN0 = 'EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv';
const TOKEN1 = 'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi';
const PROVIDER = createMockObj<Router['provider']>();
const ROUTER_ADDRESS = 'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt';
const ROUTER_REVISION = createMockObj<RouterRevision>({
  gasConstants: {
    swap: new BN(1),
    provideLp: new BN(2),
    swapForward: new BN(3),
    provideLpForward: new BN(4),
  },
  getPoolAddress: vi.fn(
    () =>
      // Pool address for TOKEN0 and TOKEN1
      new Address('EQAp3YxqaE1WhyUeHa0-7PGjjxXZdPy47d8wCdRPOHwB-Oaa'),
  ),
  getData: vi.fn(() => ({
    isLocked: false,
    adminAddress: new Address(
      'EQBJm7wS-5M9SmJ3xLMCj8Ol-JKLikGDj-GfDwL1_6b7cENC',
    ),
    tempUpgrade: (() => {
      const cell = new Cell();
      cell.bits.writeString('tempUpgrade');

      return cell;
    })(),
    poolCode: (() => {
      const cell = new Cell();
      cell.bits.writeString('poolCode');

      return cell;
    })(),
    jettonLpWalletCode: (() => {
      const cell = new Cell();
      cell.bits.writeString('jettonLpWalletCode');

      return cell;
    })(),
    lpAccountCode: (() => {
      const cell = new Cell();
      cell.bits.writeString('lpAccountCode');

      return cell;
    })(),
  })),
  createSwapBody: vi.fn(() => {
    const cell = new Cell();
    cell.bits.writeString('createSwapBody');

    return cell;
  }),
  createProvideLiquidityBody: vi.fn(() => {
    const cell = new Cell();
    cell.bits.writeString('createProvideLiquidityBody');

    return cell;
  }),
  constructPoolRevision: vi.fn(() => createMockObj<Pool>({})),
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Router', () => {
  describe('constructor', () => {
    it('should build router with a custom revision class', () => {
      const revision = createMockObj<RouterRevision>({});
      const router = new Router(PROVIDER, {
        revision,
        address: ROUTER_ADDRESS,
      });

      expect(router).toBeInstanceOf(Router);
    });
    it('should build router with a specific string revision', () => {
      const router = new Router(PROVIDER, {
        revision: 'V1',
        address: ROUTER_ADDRESS,
      });

      expect(router).toBeInstanceOf(Router);
    });
    it('should throw if unknown string revision is provided', () => {
      expect(
        () =>
          new Router(PROVIDER, {
            revision: 'unknown' as any,
            address: ROUTER_ADDRESS,
          }),
      ).toThrow();
    });
  });

  describe('gasConstants', () => {
    it('should return gas constants from revision', () => {
      const router = new Router(PROVIDER, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      expect(router.gasConstants).toBe(ROUTER_REVISION.gasConstants);
    });
  });

  describe('createSwapBody', () => {
    it('should call revision.createSwapBody with all params and return expected result', async () => {
      const router = new Router(PROVIDER, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const params: Parameters<InstanceType<typeof Router>['createSwapBody']> =
        [
          {
            userWalletAddress:
              'EQB3YmWW5ZLhe2gPUAw550e2doyWnkj5hzv3TXp2ekpAWe7v',
            minAskAmount: new BN(900000000),
            askJettonWalletAddress:
              'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi',
            referralAddress: 'EQCguqiHctoMqY28fFHWuXnY9XY-2ju1ZPBakEZa7f3Q7hr9',
          },
        ];

      const body = await router.createSwapBody(...params);

      expect(ROUTER_REVISION.createSwapBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createSwapBody).toBeCalledWith(router, ...params);

      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEAAAABxjcmVhdGVTd2FwQm9kefSOOQc="',
      );
    });
  });

  describe('createProvideLiquidityBody', () => {
    it('should call revision.createProvideLiquidityBody with all params and return expected result', async () => {
      const router = new Router(PROVIDER, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const params: Parameters<
        InstanceType<typeof Router>['createProvideLiquidityBody']
      > = [
        {
          routerWalletAddress:
            'EQB3YmWW5ZLhe2gPUAw550e2doyWnkj5hzv3TXp2ekpAWe7v',
          minLpOut: new BN(900000000),
        },
      ];

      const body = await router.createProvideLiquidityBody(...params);

      expect(ROUTER_REVISION.createProvideLiquidityBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createProvideLiquidityBody).toBeCalledWith(
        router,
        ...params,
      );

      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAHAAAADRjcmVhdGVQcm92aWRlTGlxdWlkaXR5Qm9keRCnODg="',
      );
    });
  });

  describe('getPoolAddress', () => {
    it('should call revision.getPoolAddress with all params and return expected result', async () => {
      const router = new Router(PROVIDER, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const params: Parameters<InstanceType<typeof Router>['getPoolAddress']> =
        [
          {
            token0:
              '0:b90a4147ba83fea581fa8d73b1c92cf82dcc92b0c6df924c3c0553d713b35e6c',
            token1:
              '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          },
        ];

      const poolAddress = await router.getPoolAddress(...params);

      expect(ROUTER_REVISION.getPoolAddress).toBeCalledTimes(1);
      expect(ROUTER_REVISION.getPoolAddress).toBeCalledWith(router, ...params);

      expect(poolAddress?.toString()).toMatchInlineSnapshot(
        '"EQAp3YxqaE1WhyUeHa0-7PGjjxXZdPy47d8wCdRPOHwB-Oaa"',
      );
    });
  });

  describe('getPool', () => {
    const provider = createMockObj<Router['provider']>({
      call2: vi.fn(async (...args) => {
        if (
          args[0] === 'EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv' &&
          args[1] === 'get_wallet_address'
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              'te6ccsEBAQEAJAAAAEOAFyFIKPdQf9SwP1GudjklnwW5klYY2/JJh4CqeuJ2a82QaHOF8w==',
            ),
          );
        }
        if (
          args[0] === 'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi' &&
          args[1] === 'get_wallet_address'
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              'te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==',
            ),
          );
        }
      }),
    });

    it('should call revision.getPoolAddress all return Pool instance', async () => {
      const router = new Router(provider, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const pool = await router.getPool({
        jettonAddresses: [TOKEN0, TOKEN1],
      });

      expect(ROUTER_REVISION.getPoolAddress).toBeCalledTimes(1);
      expect(ROUTER_REVISION.getPoolAddress).toBeCalledWith(
        router,
        expect.objectContaining({
          token0: new Address(
            '0:b90a4147ba83fea581fa8d73b1c92cf82dcc92b0c6df924c3c0553d713b35e6c',
          ),
          token1: new Address(
            '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          ),
        }),
      );
      expect(ROUTER_REVISION.constructPoolRevision).toBeCalledTimes(1);
      expect(ROUTER_REVISION.constructPoolRevision).toBeCalledWith(router);

      expect(pool).toBeInstanceOf(Pool);
    });
    it('should return null if pool not found', async () => {
      const router = new Router(provider, {
        revision: {
          ...ROUTER_REVISION,
          getPoolAddress: vi.fn(async () => null),
        },
        address: ROUTER_ADDRESS,
      });

      const pool = await router.getPool({
        jettonAddresses: [TOKEN0, TOKEN1],
      });

      expect(pool).toBeNull();
    });
  });

  describe('getData', () => {
    it('should call revision.getData with all params and return expected result', async () => {
      const router = new Router(PROVIDER, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const data = await router.getData();

      expect(ROUTER_REVISION.getData).toBeCalledTimes(1);
      expect(ROUTER_REVISION.getData).toBeCalledWith(router);

      expect(data.isLocked).toBe(false);
      expect(data.adminAddress?.toString()).toMatchInlineSnapshot(
        '"EQBJm7wS-5M9SmJ3xLMCj8Ol-JKLikGDj-GfDwL1_6b7cENC"',
      );
      expect(
        bytesToBase64(await data.tempUpgrade.toBoc()),
      ).toMatchInlineSnapshot('"te6ccsEBAQEADQAAABZ0ZW1wVXBncmFkZV5U2r0="');
      expect(bytesToBase64(await data.poolCode.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEACgAAABBwb29sQ29kZbzwUoo="',
      );
      expect(
        bytesToBase64(await data.jettonLpWalletCode.toBoc()),
      ).toMatchInlineSnapshot(
        '"te6ccsEBAQEAFAAAACRqZXR0b25McFdhbGxldENvZGWxxW04"',
      );
      expect(
        bytesToBase64(await data.lpAccountCode.toBoc()),
      ).toMatchInlineSnapshot('"te6ccsEBAQEADwAAABpscEFjY291bnRDb2Rl/hz48A=="');
    });
  });

  describe('buildSwapJettonTxParams', () => {
    const userWalletAddress =
      'EQB3YmWW5ZLhe2gPUAw550e2doyWnkj5hzv3TXp2ekpAWe7v';
    const offerJettonAddress = TOKEN0;
    const askJettonAddress = TOKEN1;
    const offerAmount = new BN(500000000);
    const minAskAmount = new BN(200000000);

    const provider = createMockObj<Router['provider']>({
      ...PROVIDER,
      call2: vi.fn(async (...args) => {
        if (
          args[0] === 'EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv' &&
          args[1] === 'get_wallet_address'
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              'te6ccsEBAQEAJAAAAEOACD+9EGh6wT/2pEbZWrfCmVbsdpQVGU9308qh2gel9QwQM97q5A==',
            ),
          );
        }
        if (
          args[0] === 'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi' &&
          args[1] === 'get_wallet_address'
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              'te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==',
            ),
          );
        }
      }),
    });

    it('should build expected params by using createSwapBody method', async () => {
      const router = new Router(provider, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const params = await router.buildSwapJettonTxParams({
        userWalletAddress,
        offerJettonAddress,
        askJettonAddress,
        offerAmount,
        minAskAmount,
      });

      expect(ROUTER_REVISION.createSwapBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createSwapBody).toBeCalledWith(
        router,
        expect.objectContaining({
          userWalletAddress,
          minAskAmount,
          askJettonWalletAddress: new Address(
            '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          ),
        }),
      );

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"0:41fde88343d609ffb52236cad5be14cab763b4a0a8ca7bbe9e550ed03d2fa860"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEARwAANwFnD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwEDwEAHGNyZWF0ZVN3YXBCb2R5Y5yczQ=="',
      );
      expect(params.gasAmount).toEqual(ROUTER_REVISION.gasConstants.swap);
    });
    it('should build expected params when referralAddress is defined', async () => {
      const router = new Router(provider, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const referralAddress =
        'EQBJm7wS-5M9SmJ3xLMCj8Ol-JKLikGDj-GfDwL1_6b7cENC';

      const params = await router.buildSwapJettonTxParams({
        userWalletAddress,
        offerJettonAddress,
        askJettonAddress,
        offerAmount,
        minAskAmount,
        referralAddress,
      });

      expect(ROUTER_REVISION.createSwapBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createSwapBody).toBeCalledWith(
        router,
        expect.objectContaining({
          userWalletAddress,
          minAskAmount,
          askJettonWalletAddress: new Address(
            '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          ),
          referralAddress,
        }),
      );

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"0:41fde88343d609ffb52236cad5be14cab763b4a0a8ca7bbe9e550ed03d2fa860"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEARwAANwFnD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwEDwEAHGNyZWF0ZVN3YXBCb2R5Y5yczQ=="',
      );
      expect(params.gasAmount).toEqual(ROUTER_REVISION.gasConstants.swap);
    });
    it('should build expected params when gasAmount is defined', async () => {
      const router = new Router(provider, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const gasAmount = new BN(123456789);

      const params = await router.buildSwapJettonTxParams({
        userWalletAddress,
        offerJettonAddress,
        askJettonAddress,
        offerAmount,
        minAskAmount,
        gasAmount,
      });

      expect(ROUTER_REVISION.createSwapBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createSwapBody).toBeCalledWith(
        router,
        expect.objectContaining({
          userWalletAddress,
          minAskAmount,
          askJettonWalletAddress: new Address(
            '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          ),
        }),
      );

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"0:41fde88343d609ffb52236cad5be14cab763b4a0a8ca7bbe9e550ed03d2fa860"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEARwAANwFnD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwEDwEAHGNyZWF0ZVN3YXBCb2R5Y5yczQ=="',
      );
      expect(params.gasAmount).toEqual(gasAmount);
    });
    it('should build expected params when forwardGasAmount is defined', async () => {
      const router = new Router(provider, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const forwardGasAmount = new BN(123456789);

      const params = await router.buildSwapJettonTxParams({
        userWalletAddress,
        offerJettonAddress,
        askJettonAddress,
        offerAmount,
        minAskAmount,
        forwardGasAmount,
      });

      expect(ROUTER_REVISION.createSwapBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createSwapBody).toBeCalledWith(
        router,
        expect.objectContaining({
          userWalletAddress,
          minAskAmount,
          askJettonWalletAddress: new Address(
            '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          ),
        }),
      );

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"0:41fde88343d609ffb52236cad5be14cab763b4a0a8ca7bbe9e550ed03d2fa860"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEASgAAOgFtD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwQHW80VwEAHGNyZWF0ZVN3YXBCb2R5A3iuuw=="',
      );
      expect(params.gasAmount).toEqual(ROUTER_REVISION.gasConstants.swap);
    });
    it('should build expected params when queryId is defined', async () => {
      const router = new Router(provider, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const queryId = 12345;

      const params = await router.buildSwapJettonTxParams({
        userWalletAddress,
        offerJettonAddress,
        askJettonAddress,
        offerAmount,
        minAskAmount,
        queryId,
      });

      expect(ROUTER_REVISION.createSwapBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createSwapBody).toBeCalledWith(
        router,
        expect.objectContaining({
          userWalletAddress,
          minAskAmount,
          askJettonWalletAddress: new Address(
            '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          ),
        }),
      );

      expect(params.to.toString()).toMatchInlineSnapshot(
        '"0:41fde88343d609ffb52236cad5be14cab763b4a0a8ca7bbe9e550ed03d2fa860"',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEARwAANwFnD4p+pQAAAAAAADA5QdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwEDwEAHGNyZWF0ZVN3YXBCb2R5mpxxhQ=="',
      );
      expect(params.gasAmount).toEqual(ROUTER_REVISION.gasConstants.swap);
    });
  });

  describe('buildSwapProxyTonTxParams', () => {
    const userWalletAddress =
      'EQB3YmWW5ZLhe2gPUAw550e2doyWnkj5hzv3TXp2ekpAWe7v';
    const proxyTonAddress = 'EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez';
    const askJettonAddress = 'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi';
    const offerAmount = new BN(500000000);
    const minAskAmount = new BN(200000000);

    const provider = createMockObj<Router['provider']>({
      ...PROVIDER,
      call2: vi.fn(async (...args) => {
        if (
          args[0] === 'EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez' &&
          args[1] === 'get_wallet_address'
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              'te6ccsEBAQEAJAAAAEOAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPwJB4oTQ==',
            ),
          );
        }
        if (
          args[0] === 'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi' &&
          args[1] === 'get_wallet_address'
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              'te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==',
            ),
          );
        }
      }),
    });

    it('should build expected params by using createSwapBody method', async () => {
      const router = new Router(provider, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const params = await router.buildSwapProxyTonTxParams({
        userWalletAddress,
        proxyTonAddress,
        askJettonAddress,
        offerAmount,
        minAskAmount,
      });

      expect(ROUTER_REVISION.createSwapBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createSwapBody).toBeCalledWith(
        router,
        expect.objectContaining({
          userWalletAddress,
          minAskAmount,
          askJettonWalletAddress: new Address(
            '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          ),
        }),
      );

      expect(params.to.toString()).toBe(
        '0:1150b518b2626ad51899f98887f8824b70065456455f7fe2813f012699a4061f',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEARwAANwFnD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwEDwEAHGNyZWF0ZVN3YXBCb2R5Y5yczQ=="',
      );
      expect(params.gasAmount).toEqual(
        offerAmount.add(ROUTER_REVISION.gasConstants.swapForward),
      );
    });
    it('should build expected params when referralAddress is defined', async () => {
      const router = new Router(provider, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const referralAddress =
        'EQBJm7wS-5M9SmJ3xLMCj8Ol-JKLikGDj-GfDwL1_6b7cENC';

      const params = await router.buildSwapProxyTonTxParams({
        userWalletAddress,
        proxyTonAddress,
        askJettonAddress,
        offerAmount,
        minAskAmount,
        referralAddress,
      });

      expect(ROUTER_REVISION.createSwapBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createSwapBody).toBeCalledWith(
        router,
        expect.objectContaining({
          userWalletAddress,
          minAskAmount,
          askJettonWalletAddress: new Address(
            '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          ),
          referralAddress,
        }),
      );

      expect(params.to.toString()).toBe(
        '0:1150b518b2626ad51899f98887f8824b70065456455f7fe2813f012699a4061f',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEARwAANwFnD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwEDwEAHGNyZWF0ZVN3YXBCb2R5Y5yczQ=="',
      );
      expect(params.gasAmount).toEqual(
        offerAmount.add(ROUTER_REVISION.gasConstants.swapForward),
      );
    });
    it('should build expected params when forwardGasAmount is defined', async () => {
      const router = new Router(provider, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const forwardGasAmount = new BN(123456789);

      const params = await router.buildSwapProxyTonTxParams({
        userWalletAddress,
        proxyTonAddress,
        askJettonAddress,
        offerAmount,
        minAskAmount,
        forwardGasAmount,
      });

      expect(ROUTER_REVISION.createSwapBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createSwapBody).toBeCalledWith(
        router,
        expect.objectContaining({
          userWalletAddress,
          minAskAmount,
          askJettonWalletAddress: new Address(
            '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          ),
        }),
      );

      expect(params.to.toString()).toBe(
        '0:1150b518b2626ad51899f98887f8824b70065456455f7fe2813f012699a4061f',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEASgAAOgFtD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwQHW80VwEAHGNyZWF0ZVN3YXBCb2R5A3iuuw=="',
      );
      expect(params.gasAmount).toEqual(offerAmount.add(forwardGasAmount));
    });
    it('should build expected params when queryId is defined', async () => {
      const router = new Router(provider, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const queryId = 12345;

      const params = await router.buildSwapProxyTonTxParams({
        userWalletAddress,
        proxyTonAddress,
        askJettonAddress,
        offerAmount,
        minAskAmount,
        queryId,
      });

      expect(ROUTER_REVISION.createSwapBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createSwapBody).toBeCalledWith(
        router,
        expect.objectContaining({
          userWalletAddress,
          minAskAmount,
          askJettonWalletAddress: new Address(
            '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          ),
        }),
      );

      expect(params.to.toString()).toBe(
        '0:1150b518b2626ad51899f98887f8824b70065456455f7fe2813f012699a4061f',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEARwAANwFnD4p+pQAAAAAAADA5QdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwEDwEAHGNyZWF0ZVN3YXBCb2R5mpxxhQ=="',
      );
      expect(params.gasAmount).toEqual(
        offerAmount.add(ROUTER_REVISION.gasConstants.swapForward),
      );
    });
  });

  describe('buildProvideLiquidityJettonTxParams', () => {
    const userWalletAddress =
      'EQB3YmWW5ZLhe2gPUAw550e2doyWnkj5hzv3TXp2ekpAWe7v';
    const sendTokenAddress = TOKEN0;
    const otherTokenAddress = TOKEN1;
    const sendAmount = new BN(500000000);
    const minLpOut = new BN(1);

    const provider = createMockObj<Router['provider']>({
      ...PROVIDER,
      call2: vi.fn(async (...args) => {
        if (
          args[0] === 'EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv' &&
          args[1] === 'get_wallet_address'
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              'te6ccsEBAQEAJAAAAEOACD+9EGh6wT/2pEbZWrfCmVbsdpQVGU9308qh2gel9QwQM97q5A==',
            ),
          );
        }
        if (
          args[0] === 'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi' &&
          args[1] === 'get_wallet_address'
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              'te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==',
            ),
          );
        }
      }),
    });

    it('should build expected params by using createProvideLiquidityBody method', async () => {
      const router = new Router(provider, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const params = await router.buildProvideLiquidityJettonTxParams({
        userWalletAddress,
        sendTokenAddress,
        otherTokenAddress,
        sendAmount,
        minLpOut,
      });

      expect(ROUTER_REVISION.createProvideLiquidityBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createProvideLiquidityBody).toBeCalledWith(
        router,
        expect.objectContaining({
          routerWalletAddress: new Address(
            '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          ),
          minLpOut,
        }),
      );

      expect(params.to.toString()).toBe(
        '0:41fde88343d609ffb52236cad5be14cab763b4a0a8ca7bbe9e550ed03d2fa860',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAUwAANwFnD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwEEwEANGNyZWF0ZVByb3ZpZGVMaXF1aWRpdHlCb2R50W/y2g=="',
      );
      expect(params.gasAmount).toEqual(ROUTER_REVISION.gasConstants.provideLp);
    });
    it('should build expected params when gasAmount is defined', async () => {
      const router = new Router(provider, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const gasAmount = new BN(12345);

      const params = await router.buildProvideLiquidityJettonTxParams({
        userWalletAddress,
        sendTokenAddress,
        otherTokenAddress,
        sendAmount,
        minLpOut,
        gasAmount,
      });

      expect(ROUTER_REVISION.createProvideLiquidityBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createProvideLiquidityBody).toBeCalledWith(
        router,
        expect.objectContaining({
          routerWalletAddress: new Address(
            '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          ),
          minLpOut,
        }),
      );

      expect(params.to.toString()).toBe(
        '0:41fde88343d609ffb52236cad5be14cab763b4a0a8ca7bbe9e550ed03d2fa860',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAUwAANwFnD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwEEwEANGNyZWF0ZVByb3ZpZGVMaXF1aWRpdHlCb2R50W/y2g=="',
      );
      expect(params.gasAmount).toEqual(gasAmount);
    });
    it('should build expected params when forwardGasAmount is defined', async () => {
      const router = new Router(provider, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const forwardGasAmount = new BN(123456789);

      const params = await router.buildProvideLiquidityJettonTxParams({
        userWalletAddress,
        sendTokenAddress,
        otherTokenAddress,
        sendAmount,
        minLpOut,
        forwardGasAmount,
      });

      expect(ROUTER_REVISION.createProvideLiquidityBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createProvideLiquidityBody).toBeCalledWith(
        router,
        expect.objectContaining({
          routerWalletAddress: new Address(
            '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          ),
          minLpOut,
        }),
      );

      expect(params.to.toString()).toBe(
        '0:41fde88343d609ffb52236cad5be14cab763b4a0a8ca7bbe9e550ed03d2fa860',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAVgAAOgFtD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwQHW80VwEANGNyZWF0ZVByb3ZpZGVMaXF1aWRpdHlCb2R5hpMt4w=="',
      );
      expect(params.gasAmount).toEqual(ROUTER_REVISION.gasConstants.provideLp);
    });
    it('should build expected params when queryId is defined', async () => {
      const router = new Router(provider, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const queryId = 12345;

      const params = await router.buildProvideLiquidityJettonTxParams({
        userWalletAddress,
        sendTokenAddress,
        otherTokenAddress,
        sendAmount,
        minLpOut,
        queryId,
      });

      expect(ROUTER_REVISION.createProvideLiquidityBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createProvideLiquidityBody).toBeCalledWith(
        router,
        expect.objectContaining({
          routerWalletAddress: new Address(
            '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          ),
          minLpOut,
        }),
      );

      expect(params.to.toString()).toBe(
        '0:41fde88343d609ffb52236cad5be14cab763b4a0a8ca7bbe9e550ed03d2fa860',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAUwAANwFnD4p+pQAAAAAAADA5QdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwEEwEANGNyZWF0ZVByb3ZpZGVMaXF1aWRpdHlCb2R5OI61fQ=="',
      );
      expect(params.gasAmount).toEqual(ROUTER_REVISION.gasConstants.provideLp);
    });
  });

  describe('buildProvideLiquidityProxyTonTxParams', () => {
    const userWalletAddress =
      'EQB3YmWW5ZLhe2gPUAw550e2doyWnkj5hzv3TXp2ekpAWe7v';
    const proxyTonAddress = 'EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez';
    const otherTokenAddress =
      'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi';
    const sendAmount = new BN(500000000);
    const minLpOut = new BN(1);

    const provider = createMockObj<Router['provider']>({
      ...PROVIDER,
      call2: vi.fn(async (...args) => {
        if (
          args[0] === 'EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez' &&
          args[1] === 'get_wallet_address'
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              'te6ccsEBAQEAJAAAAEOAAioWoxZMTVqjEz8xEP8QSW4AyorIq+/8UCfgJNM0gMPwJB4oTQ==',
            ),
          );
        }
        if (
          args[0] === 'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi' &&
          args[1] === 'get_wallet_address'
        ) {
          return Cell.oneFromBoc(
            base64ToBytes(
              'te6ccsEBAQEAJAAAAEOAAQDOYNkjxevc0Ludmj5oWQzsz/S9vn9/b/V0DLdsOUWw40LsPA==',
            ),
          );
        }
      }),
    });

    it('should build expected params by using createProvideLiquidityBody method', async () => {
      const router = new Router(provider, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const params = await router.buildProvideLiquidityProxyTonTxParams({
        userWalletAddress,
        proxyTonAddress,
        otherTokenAddress,
        sendAmount,
        minLpOut,
      });

      expect(ROUTER_REVISION.createProvideLiquidityBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createProvideLiquidityBody).toBeCalledWith(
        router,
        expect.objectContaining({
          routerWalletAddress: new Address(
            '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          ),
          minLpOut,
        }),
      );

      expect(params.to.toString()).toBe(
        '0:1150b518b2626ad51899f98887f8824b70065456455f7fe2813f012699a4061f',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAUwAANwFnD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwECwEANGNyZWF0ZVByb3ZpZGVMaXF1aWRpdHlCb2R5+AFwKQ=="',
      );
      expect(params.gasAmount).toEqual(
        ROUTER_REVISION.gasConstants.provideLp.add(sendAmount),
      );
    });
    it('should build expected params when forwardGasAmount is defined', async () => {
      const router = new Router(provider, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const forwardGasAmount = new BN(123456789);

      const params = await router.buildProvideLiquidityProxyTonTxParams({
        userWalletAddress,
        proxyTonAddress,
        otherTokenAddress,
        sendAmount,
        minLpOut,
        forwardGasAmount,
      });

      expect(ROUTER_REVISION.createProvideLiquidityBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createProvideLiquidityBody).toBeCalledWith(
        router,
        expect.objectContaining({
          routerWalletAddress: new Address(
            '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          ),
          minLpOut,
        }),
      );

      expect(params.to.toString()).toBe(
        '0:1150b518b2626ad51899f98887f8824b70065456455f7fe2813f012699a4061f',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAVgAAOgFtD4p+pQAAAAAAAAAAQdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwQHW80VwEANGNyZWF0ZVByb3ZpZGVMaXF1aWRpdHlCb2R5hpMt4w=="',
      );
      expect(params.gasAmount).toEqual(sendAmount.add(forwardGasAmount));
    });
    it('should build expected params when queryId is defined', async () => {
      const router = new Router(provider, {
        revision: ROUTER_REVISION,
        address: ROUTER_ADDRESS,
      });

      const queryId = 12345;

      const params = await router.buildProvideLiquidityProxyTonTxParams({
        userWalletAddress,
        proxyTonAddress,
        otherTokenAddress,
        sendAmount,
        minLpOut,
        queryId,
      });

      expect(ROUTER_REVISION.createProvideLiquidityBody).toBeCalledTimes(1);
      expect(ROUTER_REVISION.createProvideLiquidityBody).toBeCalledWith(
        router,
        expect.objectContaining({
          routerWalletAddress: new Address(
            '0:08067306c91e2f5ee685dcecd1f342c867667fa5edf3fbfb7faba065bb61ca2d',
          ),
          minLpOut,
        }),
      );

      expect(params.to.toString()).toBe(
        '0:1150b518b2626ad51899f98887f8824b70065456455f7fe2813f012699a4061f',
      );
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAgEAUwAANwFnD4p+pQAAAAAAADA5QdzWUAgA7zuZAqJxsqAciTilI8/iTnGEeq62piAAHtRKd6wOcJwECwEANGNyZWF0ZVByb3ZpZGVMaXF1aWRpdHlCb2R5EeA3jg=="',
      );
      expect(params.gasAmount).toEqual(
        sendAmount.add(ROUTER_REVISION.gasConstants.provideLp),
      );
    });
  });
});
