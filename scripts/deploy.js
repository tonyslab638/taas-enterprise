import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    console.log("🚀 Deploying TaaSCore...");

    const Factory = await ethers.getContractFactory("TaaSCore");
    const contract = await Factory.deploy();

    await contract.waitForDeployment();

    console.log("✅ Contract deployed to:", await contract.getAddress());
}

main().catch((err) => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
});