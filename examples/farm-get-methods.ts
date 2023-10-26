import TonWeb from 'tonweb';

import { FarmNftMinter, FarmNftItem, FARM_REVISION } from '@ston-fi/sdk';

/**
 * This example shows how you can get data
 * from the farm minter and farm nft contracts
 * using the SDK thin wrapper methods
 */

(async () => {
  const FARM_ADDRESS = ''; // ! replace with the address of a farm

  const provider = new TonWeb.HttpProvider();

  const minter = new FarmNftMinter(provider, {
    revision: FARM_REVISION.V2,
    address: FARM_ADDRESS,
  });

  // get current state of minter
  const minterData = await minter.getData();

  console.log(minterData);

  // get first NFT in minter
  const nftAddress = await minter.getNftItemAddressByIndex(0);

  const nft = new FarmNftItem(provider, {
    revision: FARM_REVISION.V1,
    address: nftAddress,
  });

  // get current state of NFT
  const nftData = await nft.getFarmingData();

  console.log(nftData);
})();
