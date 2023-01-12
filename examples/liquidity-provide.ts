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

  // Create transaction params for provide 0.5 JETTON0
  // given object also contains address where you should send payload and suggested gas amount
  const paramsRed = await router.buildProvideLiquidityTxParamsToken0({
    userWalletAddress: WALLET_ADDRESS,
    jettonAddresses: {
      token0: 'EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv',
      token1: 'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi',
    },
    lpAmount0: TonWeb.utils.toNano('0.5'),
    minLpOut: new TonWeb.utils.BN(1),
    queryId: new TonWeb.utils.BN(12345),
  });

  wallet.methods.transfer({
    secretKey: new TextEncoder().encode(WALLET_SECRET),
    toAddress: paramsRed.to,
    amount: paramsRed.gasAmount,
    seqno: (await wallet.methods.seqno().call()) ?? 0,
    payload: paramsRed.payload,
    sendMode: 3,
  });

  // Create transaction params for provide 0.2 JETTON1
  const paramsMoon = await router.buildProvideLiquidityTxParamsToken1({
    userWalletAddress: WALLET_ADDRESS,
    jettonAddresses: {
      token0: 'EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv',
      token1: 'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi',
    },
    lpAmount1: TonWeb.utils.toNano('0.1'),
    minLpOut: new TonWeb.utils.BN(1),
    queryId: new TonWeb.utils.BN(12345),
  });

  wallet.methods.transfer({
    secretKey: new TextEncoder().encode(WALLET_SECRET),
    toAddress: paramsMoon.to,
    amount: paramsMoon.gasAmount,
    seqno: (await wallet.methods.seqno().call()) ?? 0,
    payload: paramsMoon.payload,
    sendMode: 3,
  });
};
