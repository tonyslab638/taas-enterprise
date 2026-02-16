const { ethers } = require("ethers");
require("dotenv").config();

async function main(){

  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const abi = require("../artifacts/contracts/TaaSCore.sol/TaaSCore.json").abi;

  const core = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    abi,
    wallet
  );

  const id = process.argv[2];
  const newOwner = process.argv[3];

  if(!id || !newOwner){
    console.log("Usage: node scripts/transferProduct.js PRODUCT_ID NEW_OWNER_ADDRESS");
    return;
  }

  console.log("Transferring product:", id);

  const tx = await core.transferOwnership(id, newOwner);
  await tx.wait();

  console.log("Ownership transferred successfully");
}

main().catch(console.error);