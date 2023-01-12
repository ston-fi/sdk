import TonWeb from 'tonweb';

import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from '@ston-fi/sdk';

async () => {
  const WALLET_ADDRESS = '' // YOUR WALLET ADDRESS HERE
  const WALLET_SECRET = '' // YOUR WALLET SECRET HERE

  const provider = new TonWeb.HttpProvider();

  const wallet = new TonWeb(provider).wallet.create({
    address: WALLET_ADDRESS,
  });

  const router = new Router(provider, {
    revision: ROUTER_REVISION.V1,
    address: ROUTER_REVISION_ADDRESS.V1,
  });

  // Get pool for JETTON0/JETTON1 jettons
  const pool = await router.getPool({
    jettonAddresses: ['EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv', 'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi'],
  });

  if (!pool) {
    throw Error('Pool for JETTON0/JETTON1 not found');
  }

  // Get lp account for JETTON0/JETTON1 pool
  const lpAccount = await pool.getLpAccount({ ownerAddress: WALLET_ADDRESS });

  if (!lpAccount) {
    throw Error('Account for JETTON0/JETTON1 pool not found');
  }

  // Create transaction params for refund operation
  // given object also contains address where you should send payload and suggested gas amount
  const params = await lpAccount.buildRefundTxParams({
    queryId: new TonWeb.utils.BN(12345),
  });

  wallet.methods.transfer({
    secretKey: new TextEncoder().encode(WALLET_SECRET),
    toAddress: params.to,
    amount: params.gasAmount,
    seqno: (await wallet.methods.seqno().call()) ?? 0,
    payload: params.payload,
    sendMode: 3,
  });
};
