const dotenv = require("dotenv");
const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config()

const solcStable = {
  version: '^0.8.14',
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
};

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      network_id: '*',
      port: 8545,
    },
    fuji: {
      provider: () => new HDWalletProvider({
        mnemonic: process.env.MNEMONIC,
        providerOrUrl: process.env.INFURA_API_KEY,
      }),
      network_id: 43113,
      // networkCheckTimeout: 1000000000000000000000,
      // timeoutBlocks: 2000000,
      // pollingInterval: 30000,
      // addressIndex: 2,
      // confirmations: 10,
      // skipDryRun: false


    },
    bsctestnet: {
      provider: () => new HDWalletProvider({
        mnemonic: process.env.MNEMONIC,
        providerOrUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
      }),
      network_id: 97,
      // gas: 5000000,
      // gasPrice: 40000000000,
      confirmations: 1,
      timeoutBlocks: 400,
      skipDryRun: false,
      timeoutBlocks: 90000,
      networkCheckTimeout: 9000000
    }
  },

  api_keys: {
    snowtrace: process.env.snowtraceApiKey,
  },

  compilers: {
    solc: solcStable,
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: { outputFile: './gas-report' },
    enableTimeouts: true,
  },
  plugins: ['solidity-coverage', 'truffle-plugin-verify'],
};
