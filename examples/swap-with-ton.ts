import TonWeb from 'tonweb';

import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from  '@ston-fi/sdk';

/**
 * This example shows how to swap TON to jetton using the router contract
 * To be able to do this, you need to use Proxy TON contract.
 */

(async () => {
  const WALLET_ADDRESS = '' // YOUR WALLET ADDRESS HERE
  const WALLET_SECRET = '' // YOUR WALLET SECRET HERE

  const REFERRAL_ADDRESS = undefined; // REFERRAL ADDRESS (OPTIONAL)

  const PROXY_TON_ADDRESS = 'EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez' // PROXY TON 0.2.2

  const JETTON1 = 'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi';

  const provider = new TonWeb.HttpProvider();

  const wallet = new TonWeb(provider).wallet.create({
    address: WALLET_ADDRESS,
  });

  const router = new Router(provider, {
    revision: ROUTER_REVISION.V1,
    address: ROUTER_REVISION_ADDRESS.V1,
  });

  // Build transaction params to swap 500000000 TON to JETTON1
  // but not less than 200000000 JETTON1
  const paramsTonToJetton = await router.buildSwapProxyTonTxParams({
    userWalletAddress: WALLET_ADDRESS,
    proxyTonAddress: PROXY_TON_ADDRESS,
    askJettonAddress: JETTON1,
    offerAmount: new TonWeb.utils.BN(500000000),
    minAskAmount: new TonWeb.utils.BN(200000000),
    queryId: 12345,
    referralAddress: REFERRAL_ADDRESS,
  });

  wallet.methods.transfer({
    secretKey: new TextEncoder().encode(WALLET_SECRET),
    toAddress: paramsTonToJetton.to,
    amount: paramsTonToJetton.gasAmount,
    seqno: (await wallet.methods.seqno().call()) ?? 0,
    payload: paramsTonToJetton.payload,
    sendMode: 3,
  });

  // Build transaction params to swap 500000000 JETTON1 to TON
  // but not less than 200000000 TON
  const paramsJettonToTon = await router.buildSwapJettonTxParams({
    userWalletAddress: WALLET_ADDRESS,
    offerJettonAddress: JETTON1,
    askJettonAddress: PROXY_TON_ADDRESS,
    offerAmount: new TonWeb.utils.BN(500000000),
    minAskAmount: new TonWeb.utils.BN(200000000),
    queryId: 12345,
    referralAddress: REFERRAL_ADDRESS,
  });

  wallet.methods.transfer({
    secretKey: new TextEncoder().encode(WALLET_SECRET),
    toAddress: paramsJettonToTon.to,
    amount: paramsJettonToTon.gasAmount,
    seqno: (await wallet.methods.seqno().call()) ?? 0,
    payload: paramsJettonToTon.payload,
    sendMode: 3,
  });
})();
