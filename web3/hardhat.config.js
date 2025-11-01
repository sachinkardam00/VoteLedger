require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    megaeth: {
      url: process.env.MEGAETH_RPC_URL || "",
      chainId: parseInt(process.env.MEGAETH_CHAIN_ID) || 1,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  etherscan: {
    apiKey: {
      megaeth: process.env.ETHERSCAN_API_KEY || "not-needed"
    },
    customChains: [
      {
        network: "megaeth",
        chainId: parseInt(process.env.MEGAETH_CHAIN_ID) || 1,
        urls: {
          apiURL: process.env.BLOCK_EXPLORER_API || "",
          browserURL: process.env.BLOCK_EXPLORER_URL || ""
        }
      }
    ]
  },
};
