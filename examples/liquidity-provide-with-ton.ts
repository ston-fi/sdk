import TonWeb from 'tonweb';

import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from '@ston-fi/sdk';

/**
 * This example shows how to provide liquidity when one of the tokens is TON
 * To be able to do this, you need to use Proxy TON contract.
 */

(async () => {
  const WALLET_ADDRESS = ''; // YOUR WALLET ADDRESS
  const WALLET_SECRET = ''; // YOUR WALLET SECRET

  const PROXY_TON_ADDRESS = 'EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez'; // PROXY TON 0.2.2
  const JETTON1 = 'EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv';

  const provider = new TonWeb.HttpProvider();

  const wallet = new TonWeb(provider).wallet.create({
    address: WALLET_ADDRESS,
  });

  const router = new Router(provider, {
    revision: ROUTER_REVISION.V1,
    address: ROUTER_REVISION_ADDRESS.V1,
  });

  // Build transaction params to provide 500000000 TON to Proxy TON/JETTON1 pool
  // and expect to receive at least 1 LP token
  const paramsTon = await router.buildProvideLiquidityProxyTonTxParams({
    userWalletAddress: WALLET_ADDRESS,
    proxyTonAddress: PROXY_TON_ADDRESS,
    otherTokenAddress: JETTON1,
    sendAmount: new TonWeb.utils.BN(500000000),
    minLpOut: new TonWeb.utils.BN(1),
    queryId: 12345,
  });

  wallet.methods.transfer({
    secretKey: new TextEncoder().encode(WALLET_SECRET),
    toAddress: paramsTon.to,
    amount: paramsTon.gasAmount,
    seqno: (await wallet.methods.seqno().call()) ?? 0,
    payload: paramsTon.payload,
    sendMode: 3,
  });

  // Build transaction params to provide 200000000 JETTON1 to Proxy TON/JETTON1 pool
  // and expect to receive at least 1 LP token
  const paramsJetton = await router.buildProvideLiquidityJettonTxParams({
    userWalletAddress: WALLET_ADDRESS,
    sendTokenAddress: JETTON1,
    otherTokenAddress: PROXY_TON_ADDRESS,
    sendAmount: new TonWeb.utils.BN(200000000),
    minLpOut: new TonWeb.utils.BN(1),
    queryId: 12345,
  });

  wallet.methods.transfer({
    secretKey: new TextEncoder().encode(WALLET_SECRET),
    toAddress: paramsJetton.to,
    amount: paramsJetton.gasAmount,
    seqno: (await wallet.methods.seqno().call()) ?? 0,
    payload: paramsJetton.payload,
    sendMode: 3,
  });
})();
