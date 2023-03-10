import TonWeb from 'tonweb';

import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from '@ston-fi/sdk';

/**
 * This example shows how to provide liquidity to the pool.
 * As a result, you will get LP tokens that can be used to refund your tokens from the pool.
 */

(async () => {
  const WALLET_ADDRESS = ''; // YOUR WALLET ADDRESS
  const WALLET_SECRET = ''; // YOUR WALLET SECRET

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

  // Build transaction params to provide 500000000 JETTON0 to JETTON0/JETTON1 pool
  const paramsJetton0 = await router.buildProvideLiquidityJettonTxParams({
    userWalletAddress: WALLET_ADDRESS,
    sendTokenAddress: JETTON0,
    otherTokenAddress: JETTON1,
    sendAmount: new TonWeb.utils.BN(500000000),
    minLpOut: new TonWeb.utils.BN(1),
    queryId: 12345,
  });

  wallet.methods.transfer({
    secretKey: new TextEncoder().encode(WALLET_SECRET),
    toAddress: paramsJetton0.to,
    amount: paramsJetton0.gasAmount,
    seqno: (await wallet.methods.seqno().call()) ?? 0,
    payload: paramsJetton0.payload,
    sendMode: 3,
  });

  // Build transaction params to provide 200000000 JETTON1 to JETTON0/JETTON1 pool
  const paramsJetton1 = await router.buildProvideLiquidityJettonTxParams({
    userWalletAddress: WALLET_ADDRESS,
    sendTokenAddress: JETTON1,
    otherTokenAddress: JETTON0,
    sendAmount: new TonWeb.utils.BN(200000000),
    minLpOut: new TonWeb.utils.BN(1),
    queryId: 12345,
  });

  wallet.methods.transfer({
    secretKey: new TextEncoder().encode(WALLET_SECRET),
    toAddress: paramsJetton1.to,
    amount: paramsJetton1.gasAmount,
    seqno: (await wallet.methods.seqno().call()) ?? 0,
    payload: paramsJetton1.payload,
    sendMode: 3,
  });
})();
