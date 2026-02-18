import "dotenv/config";
import { ethers } from "ethers";
import fs from "fs";

// ================= CONFIG =================

const RPC = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC) {
  console.error("❌ RPC_URL missing in .env");
  process.exit(1);
}

if (!PRIVATE_KEY) {
  console.error("❌ PRIVATE_KEY missing in .env");
  process.exit(1);
}

if (!CONTRACT_ADDRESS) {
  console.error("❌ CONTRACT_ADDRESS missing in .env");
  process.exit(1);
}

// ================= PROVIDER =================

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// ================= LOAD ABI =================

const artifact = JSON.parse(
  fs.readFileSync(
    "./artifacts/contracts/TaaSCore.sol/TaaSCore.json",
    "utf8"
  )
);

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  artifact.abi,
  wallet
);

// ================= MAIN =================

async function main() {
  try {
    const productId = "ASJUJ-" + Date.now();

    console.log("🚀 Creating product:", productId);

    const tx = await contract.createProduct(
      productId,
      "ASJUJ",
      "Titan X",
      "Electronics",
      "Factory-A",
      "Batch-1",
      wallet.address
    );

    console.log("⏳ Waiting for confirmation...");
    await tx.wait();

    console.log("✅ PRODUCT CREATED SUCCESSFULLY");
    console.log("🆔 ID:", productId);
  } catch (error) {
    console.error("❌ ERROR:", error.shortMessage || error.message);
  }
}

main();