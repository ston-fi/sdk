import TonWeb from 'tonweb';

import { LpAccountRevisionV1 } from '@/contracts/lp-account/LpAccountRevisionV1';
import { parseAddressFromCell } from '@/utils/parseAddressFromCell';
import { OP_CODES } from '@/constants';
import type { Address, Cell, BN } from '@/types';

import type { PoolRevision } from './PoolRevision';

const {
  utils: { BN, bytesToBase64 },
  boc: { Cell },
  Address,
} = TonWeb;

export class PoolRevisionV1 implements PoolRevision {
  public get gasConstants(): PoolRevision['gasConstants'] {
    return {
      collectFees: new BN(1100000000),
      burn: new BN(500000000),
    };
  }

  public createCollectFeesBody: PoolRevision['createCollectFeesBody'] = async (
    _pool,
    params,
  ) => {
    const message = new Cell();

    message.bits.writeUint(OP_CODES.COLLECT_FEES, 32);
    message.bits.writeUint(params?.queryId ?? 0, 64);

    return message;
  };

  public createBurnBody: PoolRevision['createBurnBody'] = async (
    _pool,
    params,
  ) => {
    const message = new Cell();

    message.bits.writeUint(OP_CODES.REQUEST_BURN, 32);
    message.bits.writeUint(params.queryId ?? 0, 64);
    message.bits.writeCoins(new BN(params.amount));
    message.bits.writeAddress(new Address(params.responseAddress));

    return message;
  };

  public getExpectedOutputs: PoolRevision['getExpectedOutputs'] = async (
    pool,
    params,
  ) => {
    const cell = new Cell();

    cell.bits.writeAddress(new Address(params.jettonWallet));

    const slice = bytesToBase64(await cell.toBoc(false));

    const poolAddress = await pool.getAddress();
    const result = await pool.provider.call2(
      poolAddress.toString(),
      'get_expected_outputs',
      [
        ['int', params.amount.toString()],
        ['tvm.Slice', slice],
      ],
    );

    return {
      jettonToReceive: result[0] as BN,
      protocolFeePaid: result[1] as BN,
      refFeePaid: result[2] as BN,
    };
  };

  public getExpectedTokens: PoolRevision['getExpectedTokens'] = async (
    pool,
    params,
  ) => {
    const poolAddress = await pool.getAddress();
    const result = await pool.provider.call2(
      poolAddress.toString(),
      'get_expected_tokens',
      [
        ['int', params.amount0.toString()],
        ['int', params.amount1.toString()],
      ],
    );

    return result as BN;
  };

  public getExpectedLiquidity: PoolRevision['getExpectedLiquidity'] = async (
    pool,
    params,
  ) => {
    const poolAddress = await pool.getAddress();
    const result = await pool.provider.call2(
      poolAddress.toString(),
      'get_expected_liquidity',
      [['int', params.jettonAmount.toString()]],
    );

    return {
      amount0: result[0] as BN,
      amount1: result[1] as BN,
    };
  };

  public getLpAccountAddress: PoolRevision['getLpAccountAddress'] = async (
    pool,
    params,
  ) => {
    const cell = new Cell();

    cell.bits.writeAddress(new Address(params.ownerAddress));

    const slice = bytesToBase64(await cell.toBoc(false));
    const poolAddress = await pool.getAddress();

    const result = await pool.provider.call2(
      poolAddress.toString(),
      'get_lp_account_address',
      [['tvm.Slice', slice]],
    );

    return parseAddressFromCell(result);
  };

  public constructLpAccountRevision: PoolRevision['constructLpAccountRevision'] =
    (_pool) => new LpAccountRevisionV1();

  public getData: PoolRevision['getData'] = async (pool) => {
    const contractAddress = await pool.getAddress();

    const result = await pool.provider.call2(
      contractAddress.toString(),
      'get_pool_data',
    );

    return {
      reserve0: result[0] as BN,
      reserve1: result[1] as BN,
      token0WalletAddress: parseAddressFromCell(result[2]),
      token1WalletAddress: parseAddressFromCell(result[3]),
      lpFee: result[4] as BN,
      protocolFee: result[5] as BN,
      refFee: result[6] as BN,
      protocolFeeAddress: parseAddressFromCell(result[7]),
      collectedToken0ProtocolFee: result[8] as BN,
      collectedToken1ProtocolFee: result[9] as BN,
    };
  };
}
