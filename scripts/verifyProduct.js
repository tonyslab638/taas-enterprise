const { ethers } = require("ethers");
require("dotenv").config();

async function main() {

  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

  const abi = require("../artifacts/contracts/TaaSCore.sol/TaaSCore.json").abi;

  const core = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    abi,
    provider
  );

  const id = process.argv[2];

  if(!id){
    console.log("Usage: node scripts/verifyProduct.js PRODUCT_ID");
    return;
  }

  const product = await core.getProduct(id);

  console.log("PRODUCT DATA:");
  console.log(product);
}

main().catch(console.error);