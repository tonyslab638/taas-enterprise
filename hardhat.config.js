require("dotenv").config()

require("@nomicfoundation/hardhat-toolbox")

// ================= ENV VALIDATION =================

const {
  RPC_URL,
  PRIVATE_KEY,
  ETHERSCAN_API_KEY
} = process.env

if (!RPC_URL) throw new Error("❌ RPC_URL missing in .env")
if (!PRIVATE_KEY) throw new Error("❌ PRIVATE_KEY missing in .env")

// ================= CONFIG =================

module.exports = {
  defaultNetwork: "sepolia",

  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },

  networks: {
    hardhat: {
      chainId: 31337
    },

    localhost: {
      url: "http://127.0.0.1:8545"
    },

    sepolia: {
      url: RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      timeout: 60000
    }
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY || ""
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  mocha: {
    timeout: 40000
  }
}