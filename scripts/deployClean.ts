import hre from "hardhat";

async function main() {
  console.log("Deploying contract...");

  const factory = await hre.ethers.getContractFactory("TaaSCore");
  const contract = await factory.deploy();

  await contract.waitForDeployment();

  console.log("✅ Contract deployed to:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});