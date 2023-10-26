import TonWeb from 'tonweb';

import { FarmNftMinter, FARM_REVISION } from '@ston-fi/sdk';

/**
 * This example shows how stake tokens for farming
 */
(async () => {
  const WALLET_ADDRESS = ''; // ! replace with your wallet address
  const FARM_ADDRESS = ''; // ! replace with the address of a farm

  const provider = new TonWeb.HttpProvider();

  const minter = new FarmNftMinter(provider, {
    revision: FARM_REVISION.V2,
    address: FARM_ADDRESS,
  });

  // use helper to get address of staking jetton for your farm minter
  // of course, you also can specify address manually
  const stakingJettonAddress = await minter.getStakingJettonAddress();

  // transaction to stake tokens for farming
  const stakeTxParams = await minter.buildStakeTxParams({
    userWalletAddress: WALLET_ADDRESS,
    jettonAddress: stakingJettonAddress,
    jettonAmount: new TonWeb.utils.BN('1000000000'),

    // query id to identify your transaction in the blockchain (optional)
    queryId: 12345,
  });

  // to execute the transaction you need to send transaction to the blockchain
  // (replace with your wallet implementation, logging is used for demonstration purposes)
  console.log({
    to: stakeTxParams.to,
    amount: stakeTxParams.gasAmount,
    payload: stakeTxParams.payload,
  });
})();
