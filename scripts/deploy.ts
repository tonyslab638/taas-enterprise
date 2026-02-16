import { ethers } from "hardhat";

async function main() {

  const [deployer] = await ethers.getSigners();

  console.log("====================================");
  console.log("Deploying with:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("====================================");

  // Deploy Core V2
  const Core = await ethers.getContractFactory("TaaSProductCoreV2");

  console.log("Deploying contract...");

  const core = await Core.deploy();
  await core.waitForDeployment();

  console.log("====================================");
  console.log("✅ CORE V2 DEPLOYED");
  console.log("Address:", await core.getAddress());
  console.log("====================================");
}

main().catch((error) => {
  console.error("DEPLOY FAILED:", error);
  process.exit(1);
});