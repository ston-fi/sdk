import TonWeb from 'tonweb';

import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from '@ston-fi/sdk';

/**
 * This example shows how to burn LP tokens and get back your liquidity
 */
(async () => {
  const WALLET_ADDRESS = ''; // ! replace with your address
  const JETTON0 = 'EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO'; // STON
  const JETTON1 = 'EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA'; // jUSDT

  const provider = new TonWeb.HttpProvider();

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

  const lpTokenWallet = await pool.getJettonWallet({
    ownerAddress: WALLET_ADDRESS,
  });
  const lpTokenWalletData = await lpTokenWallet.getData();

  // transaction to burn all LP tokens
  const burnTxParams = await pool.buildBurnTxParams({
    // amount of LP tokens to burn
    amount: lpTokenWalletData.balance, // all LP tokens
    // address to receive the liquidity
    responseAddress: WALLET_ADDRESS,
    // query id to identify your transaction in the blockchain (optional)
    queryId: 12345,
  });

  // to execute the transaction you need to send transaction to the blockchain
  // (replace with your wallet implementation, logging is used for demonstration purposes)
  console.log({
    to: burnTxParams.to,
    amount: burnTxParams.gasAmount,
    payload: burnTxParams.payload,
  });
})();
