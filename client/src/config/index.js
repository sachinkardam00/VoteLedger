import VotingDAOABI from './VotingDAO.abi.json';

// Contract Configuration
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// Network Configuration
export const CHAIN_CONFIG = {
  chainId: parseInt(import.meta.env.VITE_CHAIN_ID),
  chainName: import.meta.env.VITE_CHAIN_NAME || 'MegaETH Chain',
  rpcUrl: import.meta.env.VITE_CHAIN_RPC_URL,
  nativeCurrency: {
    name: import.meta.env.VITE_NATIVE_CURRENCY_NAME || 'ETH',
    symbol: import.meta.env.VITE_NATIVE_CURRENCY_SYMBOL || 'ETH',
    decimals: parseInt(import.meta.env.VITE_NATIVE_CURRENCY_DECIMALS) || 18,
  },
  blockExplorerUrl: import.meta.env.VITE_BLOCK_EXPLORER_URL,
};

// Pinata Configuration
export const PINATA_CONFIG = {
  apiKey: import.meta.env.VITE_PINATA_API_KEY,
  secretKey: import.meta.env.VITE_PINATA_SECRET_KEY,
  jwt: import.meta.env.VITE_PINATA_JWT,
  gateway: import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/',
};

// App Configuration
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'VotingDAO',
  description: import.meta.env.VITE_APP_DESCRIPTION || 'Decentralized Election Platform',
};

// Contract ABI - Using proper JSON ABI for Wagmi/Viem compatibility
export const CONTRACT_ABI = VotingDAOABI;

// Election Status Enum
export const ElectionStatus = {
  RegistrationOpen: 0,
  RegistrationClosed: 1,
  Voting: 2,
  Paused: 3,
  Ended: 4,
};

export const ElectionStatusLabels = {
  0: "Registration Open",
  1: "Registration Closed",
  2: "Voting Active",
  3: "Paused",
  4: "Ended",
};

// Validation
export const validateConfig = () => {
  const errors = [];

  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    errors.push('CONTRACT_ADDRESS is not set in .env file');
  }

  if (!import.meta.env.VITE_CHAIN_RPC_URL) {
    errors.push('VITE_CHAIN_RPC_URL is not set properly in .env file');
  }

  if (!import.meta.env.VITE_CHAIN_ID) {
    errors.push('VITE_CHAIN_ID is not set in .env file');
  }

  return errors;
};
