import TonWeb from 'tonweb';

import { Pool } from '@/contracts/pool/Pool';
import { createJettonTransferMessage } from '@/utils/createJettonTransferMessage';
import { parseAddressFromCell } from '@/utils/parseAddressFromCell';
import { OP_CODES, ROUTER_REVISION } from '@/constants';
import type { Address, Cell, BN } from '@/types';

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
    router,
    params,
  ) => {
    const payload = new Cell();

    payload.bits.writeUint(OP_CODES.SWAP, 32);
    payload.bits.writeAddress(new Address(params.askJettonWalletAddress));
    payload.bits.writeCoins(params.minAskAmount);
    payload.bits.writeAddress(new Address(params.userWalletAddress));
    payload.bits.writeUint(0, 1);

    return createJettonTransferMessage({
      toAddress: await router.getAddress(),
      jettonAmount: params.offerAmount,
      payload: payload,
      gasAmount: params?.forwardGasAmount ?? this.gasConstants.swapForward,
      queryId: params.queryId,
    });
  };

  public createProvideLiquidityBody: RouterRevision['createProvideLiquidityBody'] =
    async (router, params) => {
      const payload = new Cell();

      payload.bits.writeUint(OP_CODES.PROVIDE_LIQUIDITY, 32);
      payload.bits.writeAddress(new Address(params.routerWalletAddress));
      payload.bits.writeCoins(params.minLpOut);

      return createJettonTransferMessage({
        toAddress: await router.getAddress(),
        jettonAmount: params.lpAmount,
        payload: payload,
        gasAmount:
          params.forwardGasAmount ?? this.gasConstants.provideLpForward,
        queryId: params.queryId,
      });
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

  public constructPool: RouterRevision['constructPool'] = (
    router,
    poolAddress,
  ) => {
    return new Pool(
      router.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: poolAddress,
        revision: ROUTER_REVISION.V1,
      },
    );
  };

  public getData: RouterRevision['getData'] = async (router) => {
    const contractAddress = await router.getAddress();
    const result = await router.provider.call2(
      contractAddress.toString(),
      'get_router_data',
      [],
    );

    return {
      isLocked: !(result[0] as BN).isZero(),
      adminAddress: parseAddressFromCell(result[1]),
      tempUpgrade: result[2] as Cell,
      poolCode: result[3] as Cell,
      jettonLpWalletCode: result[4] as Cell,
      lpAccountCode: result[5] as Cell,
    };
  };
}
