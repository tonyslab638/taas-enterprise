import hre from "hardhat";

async function main() {

  const ethers = (hre as any).ethers;

  if (!ethers) {
    throw new Error("Ethers not loaded. Check hardhat config plugin.");
  }

  const [deployer] = await ethers.getSigners();

  console.log("====================================");
  console.log("Deploying with wallet:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("====================================");

  const Factory = await ethers.getContractFactory("TaaSProductCore");

  console.log("Deploying contract...");
  const contract = await Factory.deploy();

  await contract.waitForDeployment();

  console.log("====================================");
  console.log("✅ CONTRACT DEPLOYED SUCCESSFULLY");
  console.log("Address:", await contract.getAddress());
  console.log("====================================");
}

main().catch((err) => {
  console.error("DEPLOY FAILED:", err);
  process.exit(1);
});