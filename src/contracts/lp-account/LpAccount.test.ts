import TonWeb from 'tonweb';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { createMockObj } from '@/test';

import { LpAccount } from './LpAccount';
import type { LpAccountRevision } from './LpAccountRevision';

const {
  boc: { Cell },
  utils: { BN, bytesToBase64 },
} = TonWeb;

const USER_WALLET_ADDRESS = 'EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i';
const POOL_ADDRESS = 'EQB5abRZ55HVyRlC7zqV2A1B7ZeJIVGP15zWloZv62Qe57pN';
const LP_ACCOUNT_ADDRESS = 'EQBY3SPD7y8OR6q6Q45-EcarZGHHPEBAuzd3KiMseftIvGde';
const PROVIDER = createMockObj<LpAccount['provider']>();
const LP_ACCOUNT_REVISION = createMockObj<LpAccountRevision>({
  gasConstants: {
    refund: new BN(1),
    resetGas: new BN(2),
  },
  createRefundBody: vi.fn(() => {
    const cell = new Cell();
    cell.bits.writeString('createRefundBody');

    return cell;
  }),
  createDirectAddLiquidityBody: vi.fn(() => {
    const cell = new Cell();
    cell.bits.writeString('createDirectAddLiquidityBody');

    return cell;
  }),
  createResetGasBody: vi.fn(() => {
    const cell = new Cell();
    cell.bits.writeString('createResetGasBody');

    return cell;
  }),
  getData: vi.fn(() => ({
    userAddress: USER_WALLET_ADDRESS,
    poolAddress: POOL_ADDRESS,
    amount0: new BN(0),
    amount1: new BN(1001000),
  })),
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LpAccount', () => {
  describe('constructor', () => {
    it('should build router with a custom revision class', () => {
      const revision = createMockObj<LpAccountRevision>({});
      const lpAccount = new LpAccount(PROVIDER, {
        revision,
        address: LP_ACCOUNT_ADDRESS,
      });

      expect(lpAccount).toBeInstanceOf(LpAccount);
    });
    it('should build router with a specific string revision', () => {
      const lpAccount = new LpAccount(PROVIDER, {
        revision: 'V1',
        address: LP_ACCOUNT_ADDRESS,
      });

      expect(lpAccount).toBeInstanceOf(LpAccount);
    });
    it('should throw if unknown string revision is provided', () => {
      expect(
        () =>
          new LpAccount(PROVIDER, {
            revision: 'unknown' as any,
            address: LP_ACCOUNT_ADDRESS,
          }),
      ).toThrow();
    });
  });

  describe('gasConstants', () => {
    it('should return gas constants from revision', () => {
      const lpAccount = new LpAccount(PROVIDER, {
        revision: LP_ACCOUNT_REVISION,
        address: LP_ACCOUNT_ADDRESS,
      });

      expect(lpAccount.gasConstants).toBe(LP_ACCOUNT_REVISION.gasConstants);
    });
  });

  describe('createRefundBody', () => {
    it('should call revision.createRefundBody with all params and return expected result', async () => {
      const lpAccount = new LpAccount(PROVIDER, {
        revision: LP_ACCOUNT_REVISION,
        address: LP_ACCOUNT_ADDRESS,
      });

      const params: Required<
        Parameters<InstanceType<typeof LpAccount>['createRefundBody']>
      > = [
        {
          queryId: 12345,
        },
      ];

      const body = await lpAccount.createRefundBody(...params);

      expect(LP_ACCOUNT_REVISION.createRefundBody).toBeCalledTimes(1);
      expect(LP_ACCOUNT_REVISION.createRefundBody).toHaveBeenCalledWith(
        lpAccount,
        ...params,
      );

      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEgAAACBjcmVhdGVSZWZ1bmRCb2R5HJ3cuw=="',
      );
    });
  });

  describe('createDirectAddLiquidityBody', () => {
    it('should call revision.createDirectAddLiquidityBody with all params and return expected result', async () => {
      const lpAccount = new LpAccount(PROVIDER, {
        revision: LP_ACCOUNT_REVISION,
        address: LP_ACCOUNT_ADDRESS,
      });

      const params: Required<
        Parameters<
          InstanceType<typeof LpAccount>['createDirectAddLiquidityBody']
        >
      > = [
        {
          amount0: new BN(1),
          amount1: new BN(2),
          minimumLpToMint: new BN(3),
          queryId: 12345,
        },
      ];

      const body = await lpAccount.createDirectAddLiquidityBody(...params);

      expect(LP_ACCOUNT_REVISION.createDirectAddLiquidityBody).toBeCalledTimes(
        1,
      );
      expect(
        LP_ACCOUNT_REVISION.createDirectAddLiquidityBody,
      ).toHaveBeenCalledWith(lpAccount, ...params);

      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAHgAAADhjcmVhdGVEaXJlY3RBZGRMaXF1aWRpdHlCb2R5LYLS3A=="',
      );
    });
  });

  describe('createResetGasBody', () => {
    it('should call revision.createResetGasBody with all params and return expected result', async () => {
      const lpAccount = new LpAccount(PROVIDER, {
        revision: LP_ACCOUNT_REVISION,
        address: LP_ACCOUNT_ADDRESS,
      });

      const params: Required<
        Parameters<InstanceType<typeof LpAccount>['createResetGasBody']>
      > = [
        {
          queryId: 12345,
        },
      ];

      const body = await lpAccount.createResetGasBody(...params);

      expect(LP_ACCOUNT_REVISION.createResetGasBody).toBeCalledTimes(1);
      expect(LP_ACCOUNT_REVISION.createResetGasBody).toHaveBeenCalledWith(
        lpAccount,
        ...params,
      );

      expect(bytesToBase64(await body.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAFAAAACRjcmVhdGVSZXNldEdhc0JvZHnOomJJ"',
      );
    });
  });

  describe('getData', () => {
    it('should call revision.getData and return it result', async () => {
      const lpAccount = new LpAccount(PROVIDER, {
        revision: LP_ACCOUNT_REVISION,
        address: LP_ACCOUNT_ADDRESS,
      });

      const data = await lpAccount.getData();

      expect(LP_ACCOUNT_REVISION.getData).toBeCalledTimes(1);
      expect(LP_ACCOUNT_REVISION.getData).toHaveBeenCalledWith(lpAccount);

      expect(data.poolAddress).toBeDefined();
      expect(data.userAddress).toBeDefined();
      expect(data.amount0).toBeDefined();
      expect(data.amount1).toBeDefined();
    });
  });

  describe('buildRefundTxParams', () => {
    it('should build expected params by using createRefundBody method', async () => {
      const lpAccount = new LpAccount(PROVIDER, {
        revision: LP_ACCOUNT_REVISION,
        address: LP_ACCOUNT_ADDRESS,
      });

      const params = await lpAccount.buildRefundTxParams();

      expect(LP_ACCOUNT_REVISION.createRefundBody).toBeCalledTimes(1);
      expect(LP_ACCOUNT_REVISION.createRefundBody).toHaveBeenCalledWith(
        lpAccount,
        expect.objectContaining({}),
      );

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEgAAACBjcmVhdGVSZWZ1bmRCb2R5HJ3cuw=="',
      );
      expect(params.gasAmount).toBe(LP_ACCOUNT_REVISION.gasConstants.refund);
    });
    it('should build expected params when queryId is defined', async () => {
      const lpAccount = new LpAccount(PROVIDER, {
        revision: LP_ACCOUNT_REVISION,
        address: LP_ACCOUNT_ADDRESS,
      });

      const queryId = 12345;

      const params = await lpAccount.buildRefundTxParams({
        queryId,
      });

      expect(LP_ACCOUNT_REVISION.createRefundBody).toBeCalledTimes(1);
      expect(LP_ACCOUNT_REVISION.createRefundBody).toHaveBeenCalledWith(
        lpAccount,
        expect.objectContaining({
          queryId,
        }),
      );

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAEgAAACBjcmVhdGVSZWZ1bmRCb2R5HJ3cuw=="',
      );
      expect(params.gasAmount).toBe(LP_ACCOUNT_REVISION.gasConstants.refund);
    });
  });

  describe('buildDirectAddLiquidityTxParams', () => {
    const amount0 = new BN(1);
    const amount1 = new BN(2);

    it('should build expected params by using createDirectAddLiquidityBody method', async () => {
      const lpAccount = new LpAccount(PROVIDER, {
        revision: LP_ACCOUNT_REVISION,
        address: LP_ACCOUNT_ADDRESS,
      });

      const params = await lpAccount.buildDirectAddLiquidityTxParams({
        amount0,
        amount1,
      });

      expect(LP_ACCOUNT_REVISION.createDirectAddLiquidityBody).toBeCalledTimes(
        1,
      );
      expect(
        LP_ACCOUNT_REVISION.createDirectAddLiquidityBody,
      ).toHaveBeenCalledWith(
        lpAccount,
        expect.objectContaining({
          amount0,
          amount1,
        }),
      );

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAHgAAADhjcmVhdGVEaXJlY3RBZGRMaXF1aWRpdHlCb2R5LYLS3A=="',
      );
      expect(params.gasAmount).toBe(
        LP_ACCOUNT_REVISION.gasConstants.directAddLp,
      );
    });
    it('should build expected params when minimumLpToMint is defined', async () => {
      const lpAccount = new LpAccount(PROVIDER, {
        revision: LP_ACCOUNT_REVISION,
        address: LP_ACCOUNT_ADDRESS,
      });

      const minimumLpToMint = new BN(3);

      const params = await lpAccount.buildDirectAddLiquidityTxParams({
        amount0,
        amount1,
        minimumLpToMint,
      });

      expect(LP_ACCOUNT_REVISION.createDirectAddLiquidityBody).toBeCalledTimes(
        1,
      );
      expect(
        LP_ACCOUNT_REVISION.createDirectAddLiquidityBody,
      ).toHaveBeenCalledWith(
        lpAccount,
        expect.objectContaining({
          amount0,
          amount1,
          minimumLpToMint,
        }),
      );

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAHgAAADhjcmVhdGVEaXJlY3RBZGRMaXF1aWRpdHlCb2R5LYLS3A=="',
      );
      expect(params.gasAmount).toBe(
        LP_ACCOUNT_REVISION.gasConstants.directAddLp,
      );
    });
    it('should build expected params when queryId is defined', async () => {
      const lpAccount = new LpAccount(PROVIDER, {
        revision: LP_ACCOUNT_REVISION,
        address: LP_ACCOUNT_ADDRESS,
      });

      const queryId = 12345;

      const params = await lpAccount.buildDirectAddLiquidityTxParams({
        amount0,
        amount1,
        queryId,
      });

      expect(LP_ACCOUNT_REVISION.createDirectAddLiquidityBody).toBeCalledTimes(
        1,
      );
      expect(
        LP_ACCOUNT_REVISION.createDirectAddLiquidityBody,
      ).toHaveBeenCalledWith(
        lpAccount,
        expect.objectContaining({
          amount0,
          amount1,
          queryId,
        }),
      );

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAHgAAADhjcmVhdGVEaXJlY3RBZGRMaXF1aWRpdHlCb2R5LYLS3A=="',
      );
      expect(params.gasAmount).toBe(
        LP_ACCOUNT_REVISION.gasConstants.directAddLp,
      );
    });
  });

  describe('buildResetGasTxParams', () => {
    it('should build expected params by using createResetGasBody method', async () => {
      const lpAccount = new LpAccount(PROVIDER, {
        revision: LP_ACCOUNT_REVISION,
        address: LP_ACCOUNT_ADDRESS,
      });

      const params = await lpAccount.buildResetGasTxParams();

      expect(LP_ACCOUNT_REVISION.createResetGasBody).toBeCalledTimes(1);
      expect(LP_ACCOUNT_REVISION.createResetGasBody).toHaveBeenCalledWith(
        lpAccount,
        expect.objectContaining({}),
      );

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAFAAAACRjcmVhdGVSZXNldEdhc0JvZHnOomJJ"',
      );
      expect(params.gasAmount).toBe(LP_ACCOUNT_REVISION.gasConstants.resetGas);
    });
    it('should build expected params when queryId is defined', async () => {
      const lpAccount = new LpAccount(PROVIDER, {
        revision: LP_ACCOUNT_REVISION,
        address: LP_ACCOUNT_ADDRESS,
      });

      const queryId = 12345;

      const params = await lpAccount.buildResetGasTxParams({
        queryId,
      });

      expect(LP_ACCOUNT_REVISION.createResetGasBody).toBeCalledTimes(1);
      expect(LP_ACCOUNT_REVISION.createResetGasBody).toHaveBeenCalledWith(
        lpAccount,
        expect.objectContaining({
          queryId,
        }),
      );

      expect(params.to.toString()).toBe(LP_ACCOUNT_ADDRESS);
      expect(bytesToBase64(await params.payload.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAFAAAACRjcmVhdGVSZXNldEdhc0JvZHnOomJJ"',
      );
      expect(params.gasAmount).toBe(LP_ACCOUNT_REVISION.gasConstants.resetGas);
    });
  });
});
