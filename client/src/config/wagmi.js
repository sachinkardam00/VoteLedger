import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Define MegaETH Carrot chain
export const megaethCarrot = defineChain({
  id: 6342,
  name: 'MegaETH Carrot',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://carrot.megaeth.com/rpc'],
    },
    public: {
      http: ['https://carrot.megaeth.com/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MegaETH Explorer',
      url: 'https://explorer.carrot.megaeth.com',
    },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: 'VotingDAO',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [megaethCarrot],
  ssr: false,
});
