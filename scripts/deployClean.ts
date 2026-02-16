import { ethers } from "hardhat";

async function main() {

    // 👇 THIS NAME MUST MATCH YOUR CONTRACT NAME EXACTLY
    const CoreFactory = await ethers.getContractFactory("TaaSCore");

    // deploy
    const core = await CoreFactory.deploy();

    // wait deployment
    await core.waitForDeployment();

    // print address
    console.log("CORE DEPLOYED TO:", await core.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});