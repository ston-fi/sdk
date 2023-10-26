import TonWeb from 'tonweb';

import { FarmNftItem, FARM_REVISION } from '@ston-fi/sdk';

/**
 * This example shows how to claim rewards from farm NFT
 */
(async () => {
  const NFT_ADDRESS = ''; // ! replace with address of your NFT

  const provider = new TonWeb.HttpProvider();

  const nft = new FarmNftItem(provider, {
    revision: FARM_REVISION.V2,
    address: NFT_ADDRESS,
  });

  // transaction to claim rewards from farm NFT
  const claimRewardsTxParams = await nft.buildClaimRewardsTxParams({
    // query id to identify your transaction in the blockchain (optional)
    queryId: 12345,
  });

  // to execute the transaction you need to send transaction to the blockchain
  // (replace with your wallet implementation, logging is used for demonstration purposes)
  console.log({
    to: claimRewardsTxParams.to,
    amount: claimRewardsTxParams.gasAmount,
    payload: claimRewardsTxParams.payload,
  });
})();
