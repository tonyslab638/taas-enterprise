import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("====================================");
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", (await deployer.provider.getBalance(deployer.address)).toString());
  console.log("====================================");

  const Factory = await hre.ethers.getContractFactory("TaaSHierarchy");
  const contract = await Factory.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("====================================");
  console.log("✅ HIERARCHY CONTRACT DEPLOYED");
  console.log("Address:", address);
  console.log("====================================");
}

main().catch((err) => {
  console.error("DEPLOY FAILED:", err);
  process.exit(1);
});