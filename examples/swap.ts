import TonWeb from 'tonweb';

import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from '@ston-fi/sdk';

/**
 * This example shows how to swap two jettons using the router contract
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

  // transaction to swap 1.0 JETTON0 to JETTON1 but not less than 1 nano JETTON1
  const swapTxParams = await router.buildSwapJettonTxParams({
    // address of the wallet that holds offerJetton you want to swap
    userWalletAddress: WALLET_ADDRESS,
    // address of the jetton you want to swap
    offerJettonAddress: JETTON0,
    // amount of the jetton you want to swap
    offerAmount: new TonWeb.utils.BN('1000000000'),
    // address of the jetton you want to receive
    askJettonAddress: JETTON1,
    // minimal amount of the jetton you want to receive as a result of the swap.
    // If the amount of the jetton you want to receive is less than minAskAmount
    // the transaction will bounce
    minAskAmount: new TonWeb.utils.BN(1),
    // query id to identify your transaction in the blockchain (optional)
    queryId: 12345,
    // address of the wallet to receive the referral fee (optional)
    referralAddress: undefined,
  });

  // to execute the transaction you need to send transaction to the blockchain
  // (replace with your wallet implementation, logging is used for demonstration purposes)
  console.log({
    to: swapTxParams.to,
    amount: swapTxParams.gasAmount,
    payload: swapTxParams.payload,
  });

  // reverse transaction is the same,
  // you just need to swap `offerJettonAddress` and `askJettonAddress` values
  // and adjust `offerAmount` and `minAskAmount` accordingly
})();
