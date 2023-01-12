import TonWeb from 'tonweb';

import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from '@ston-fi/sdk';

async () => {
  const WALLET_ADDRESS = '' // YOUR WALLET ADDRESS HERE
  const WALLET_SECRET = '' // YOUR WALLET SECRET HERE

  const provider = new TonWeb.HttpProvider();

  const wallet = new TonWeb(provider).wallet.create({
    address: WALLET_ADDRESS,
  });

  const jetton0 = new TonWeb.token.jetton.JettonMinter(
    provider,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    {
      address: 'EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv',
    },
  );

  const jetton1 = new TonWeb.token.jetton.JettonMinter(
    provider,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    {
      address: 'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi',
    },
  );

  const router = new Router(provider, {
    revision: ROUTER_REVISION.V1,
    address: ROUTER_REVISION_ADDRESS.V1,
  });

  const userRedJettonWalletAddress =
    await jetton0.getJettonWalletAddress(new TonWeb.Address(WALLET_ADDRESS));
  const routerMoonJettonWalletAddress =
    await jetton1.getJettonWalletAddress(await router.getAddress());

  const payload = await router.createSwapBody({
    userWalletAddress: WALLET_ADDRESS,
    offerAmount: new TonWeb.utils.BN(0.5),
    minAskAmount: new TonWeb.utils.BN(0.1),
    askJettonWalletAddress: userRedJettonWalletAddress,
    forwardGasAmount: new TonWeb.utils.BN(0.1),
    queryId: new TonWeb.utils.BN(12345),
  });

  const gasAmount = router.gasConstants.swap;

  wallet.methods.transfer({
    secretKey: new TextEncoder().encode(WALLET_SECRET),
    toAddress: routerMoonJettonWalletAddress,
    amount: gasAmount,
    seqno: (await wallet.methods.seqno().call()) ?? 0,
    payload,
    sendMode: 3,
  });
};
