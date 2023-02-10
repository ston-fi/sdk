import TonWeb from 'tonweb';

import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from '@ston-fi/sdk';

/**
 * This example shows how to swap jettons using the router contract
 */

(async () => {
  const WALLET_ADDRESS = ''; // YOUR WALLET ADDRESS
  const WALLET_SECRET = ''; // YOUR WALLET SECRET

  const REFERRAL_ADDRESS = undefined; // REFERRAL ADDRESS (OPTIONAL)

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

  // Build transaction params to swap 500000000 JETTON0 to JETTON1
  // but not less than 200000000 JETTON1
  const params = await router.buildSwapJettonTxParams({
    userWalletAddress: WALLET_ADDRESS,
    offerJettonAddress: JETTON0,
    askJettonAddress: JETTON1,
    offerAmount: new TonWeb.utils.BN(500000000),
    minAskAmount: new TonWeb.utils.BN(200000000),
    queryId: 12345,

    // Set your address if you want to give referral payouts
    // from everyone who using this code to swap jettons
    referralAddress: REFERRAL_ADDRESS,
  });

  wallet.methods.transfer({
    secretKey: new TextEncoder().encode(WALLET_SECRET),
    toAddress: params.to,
    amount: params.gasAmount,
    seqno: (await wallet.methods.seqno().call()) ?? 0,
    payload: params.payload,
    sendMode: 3,
  });
})();
