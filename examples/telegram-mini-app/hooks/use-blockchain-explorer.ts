const BLOCKCHAIN_EXPLORER_BAE_URL = "https://tonviewer.com/";

function contract(address: string) {
  return `${BLOCKCHAIN_EXPLORER_BAE_URL}/${address}`;
}

function transaction(hash: string) {
  return `${BLOCKCHAIN_EXPLORER_BAE_URL}/transaction/${hash}`;
}

const blockchainExplorer = {
  contract,
  transaction,
};

export function useBlockchainExplorer() {
  return blockchainExplorer;
}
