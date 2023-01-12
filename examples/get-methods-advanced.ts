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

  const jetton0 = new TonWeb.token.jetton.JettonMinter(
    provider,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    {
      address: JETTON0,
    },
  );
  const jetton0WalletAddress = await jetton0.getJettonWalletAddress(await router.getAddress());

  const jetton1 = new TonWeb.token.jetton.JettonMinter(
    provider,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    {
      address: JETTON1,
    },
  );
  const jetton1WalletAddress = await jetton1.getJettonWalletAddress(await router.getAddress());

  const poolAddress = await router.getPoolAddress({ token0: jetton0WalletAddress, token1: jetton1WalletAddress });
};
