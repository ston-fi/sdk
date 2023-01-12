import TonWeb from 'tonweb';

import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from '@ston-fi/sdk';

async () => {
  const WALLET_ADDRESS = ''; // YOUR WALLET ADDRESS HERE

  const JETTON0 = 'EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv';
  const JETTON1 = 'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi';

  const provider = new TonWeb.HttpProvider();

  const wallet = new TonWeb(provider).wallet.create({
    address: WALLET_ADDRESS,
  });

  const router = new Router(provider, {
    revision: ROUTER_REVISION.V1,
    address: ROUTER_REVISION_ADDRESS.V1,
  });

  const routerData = await router.getData();
  const {
    isLocked,
    adminAddress,
    tempUpgrade,
    poolCode,
    jettonLpWalletCode,
    lpAccountCode,
  } = routerData;

  const pool = await router.getPool({ jettonAddresses: [JETTON0, JETTON1] });

  if (!pool) {
    throw Error('Pool for RED/MOON not found');
  }

  const poolAddress = await pool.getAddress();

  const poolData = await pool.getData();
  const {
    reserve0,
    reserve1,
    token0WalletAddress,
    token1WalletAddress,
    lpFee,
    protocolFee,
    refFee,
    protocolFeeAddress,
    collectedToken0ProtocolFee,
    collectedToken1ProtocolFee,
  } = poolData;

  const expectedLiquidityData = await pool.getExpectedLiquidity({ jettonAmount: TonWeb.utils.toNano('0.5') });
  const {
    amount0,
    amount1
  } = expectedLiquidityData;

  const expectedLpTokensAmount = await pool.getExpectedTokens({ amount0: TonWeb.utils.toNano('0.5'), amount1: TonWeb.utils.toNano('0.2') });

  if (token0WalletAddress) {
    const expectedOutputsData = await pool.getExpectedOutputs({ amount: TonWeb.utils.toNano('0.5'), jettonWallet: token0WalletAddress });

    const {
      jettonToReceive,
      protocolFeePaid,
      refFeePaid
    } = expectedOutputsData;
  }

  const lpAccountAddress = await pool.getLpAccountAddress({ ownerAddress: WALLET_ADDRESS });

  const lpAccount = await pool.getLpAccount({ ownerAddress: WALLET_ADDRESS });

  if (lpAccount) {
    const lpAccountData = await lpAccount.getData();
    const {
      userAddress,
      poolAddress,
      amount0,
      amount1
    } = lpAccountData;
  }
};
