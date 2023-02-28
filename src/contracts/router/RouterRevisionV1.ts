import TonWeb from 'tonweb';

import { PoolRevisionV1 } from '@/contracts/pool/PoolRevisionV1';
import { parseAddressFromCell } from '@/utils/parseAddressFromCell';
import { OP_CODES } from '@/constants';
import type { Cell, BN } from '@/types';

import type { RouterRevision } from './RouterRevision';

const {
  Address,
  utils: { BN, bytesToBase64 },
  boc: { Cell },
} = TonWeb;

export class RouterRevisionV1 implements RouterRevision {
  public get gasConstants(): RouterRevision['gasConstants'] {
    return {
      swap: new BN(300000000),
      provideLp: new BN(300000000),
      swapForward: new BN(265000000),
      provideLpForward: new BN(265000000),
    };
  }

  public createSwapBody: RouterRevision['createSwapBody'] = async (
    _router,
    params,
  ) => {
    const payload = new Cell();

    payload.bits.writeUint(OP_CODES.SWAP, 32);
    payload.bits.writeAddress(new Address(params.askJettonWalletAddress));
    payload.bits.writeCoins(params.minAskAmount);
    payload.bits.writeAddress(new Address(params.userWalletAddress));

    if (params.referralAddress) {
      payload.bits.writeUint(1, 1);
      payload.bits.writeAddress(new Address(params.referralAddress));
    } else {
      payload.bits.writeUint(0, 1);
    }

    return payload;
  };

  public createProvideLiquidityBody: RouterRevision['createProvideLiquidityBody'] =
    async (_router, params) => {
      const payload = new Cell();

      payload.bits.writeUint(OP_CODES.PROVIDE_LIQUIDITY, 32);
      payload.bits.writeAddress(new Address(params.routerWalletAddress));
      payload.bits.writeCoins(params.minLpOut);

      return payload;
    };

  public getPoolAddress: RouterRevision['getPoolAddress'] = async (
    router,
    params,
  ) => {
    const cellA = new Cell();
    cellA.bits.writeAddress(new Address(params.token0));

    const cellB = new Cell();
    cellB.bits.writeAddress(new Address(params.token1));

    const sliceA = bytesToBase64(await cellA.toBoc(false));
    const sliceB = bytesToBase64(await cellB.toBoc(false));

    const routerAddress = await router.getAddress();
    const result = await router.provider.call2(
      routerAddress.toString(),
      'get_pool_address',
      [
        ['tvm.Slice', sliceA],
        ['tvm.Slice', sliceB],
      ],
    );

    return parseAddressFromCell(result);
  };

  public getData: RouterRevision['getData'] = async (router) => {
    const routerAddress = await router.getAddress();
    const result = await router.provider.call2(
      routerAddress.toString(),
      'get_router_data',
      [],
    );

    return {
      isLocked: !(result[0] as BN).isZero(),
      adminAddress: parseAddressFromCell(result[1] as Cell),
      tempUpgrade: result[2] as Cell,
      poolCode: result[3] as Cell,
      jettonLpWalletCode: result[4] as Cell,
      lpAccountCode: result[5] as Cell,
    };
  };

  public constructPoolRevision: RouterRevision['constructPoolRevision'] = (
    _router,
  ) => new PoolRevisionV1();
}
