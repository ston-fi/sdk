import TonWeb from 'tonweb';

import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from '@ston-fi/sdk';

/**
 * This example shows how to refund liquidity from the your lp-account of the pool
 * to get back your tokens located on the lp-account balance
 */

(async () => {
  const WALLET_ADDRESS = '' // YOUR WALLET ADDRESS
  const WALLET_SECRET = '' // YOUR WALLET SECRET

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

  const pool = await router.getPool({
    jettonAddresses: [JETTON0, JETTON1],
  });

  if (!pool) {
    throw Error(`Pool for ${JETTON0}/${JETTON1} not found`);
  }

  const lpAccount = await pool.getLpAccount({ ownerAddress: WALLET_ADDRESS });

  if (!lpAccount) {
    throw Error(`LpAccount for ${JETTON0}/${JETTON1} & owner ${WALLET_ADDRESS} not found`);
  }

  // Build transaction params to refund all tokens from JETTON0/JETTON1 lp-account
  const params = await lpAccount.buildRefundTxParams({
    queryId: 12345,
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
