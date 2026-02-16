import { ethers } from "hardhat";

async function main() {

  const Factory = await ethers.getContractFactory("TaaSAuthorityRegistry");

  console.log("Deploying Authority...");

  const contract = await Factory.deploy();

  await contract.waitForDeployment();

  console.log("====================================");
  console.log("✅ AUTHORITY DEPLOYED");
  console.log("Address:", await contract.getAddress());
  console.log("====================================");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});