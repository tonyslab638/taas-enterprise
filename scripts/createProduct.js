const { ethers } = require("ethers");
require("dotenv").config();

async function main() {

  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const abi = require("../artifacts/contracts/TaaSCore.sol/TaaSCore.json").abi;

  const core = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    abi,
    wallet
  );

  const id = "PROD-" + Date.now();

  console.log("Creating product:", id);

  const tx = await core.createProduct(
    id,
    "ASJUJ",
    "Titan",
    "Electronics",
    "Factory-A",
    "Batch-1",
    wallet.address
  );

  console.log("Waiting confirmation...");
  await tx.wait();

  console.log("✅ PRODUCT CREATED SUCCESSFULLY");
  console.log("Product ID:", id);
}

main().catch(console.error);