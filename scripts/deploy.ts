import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function main() {

    const RPC = process.env.SEPOLIA_RPC_URL!;
    const PK = process.env.PRIVATE_KEY!;

    if (!RPC || !PK) {
        throw new Error("Missing ENV variables");
    }

    const provider = new ethers.JsonRpcProvider(RPC);
    const wallet = new ethers.Wallet(PK, provider);

    console.log("====================================");
    console.log("Deploying with:", wallet.address);

    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    console.log("====================================");

    const artifact = JSON.parse(
        fs.readFileSync(
            "./artifacts/contracts/TaaSAuthority.sol/TaaSAuthority.json",
            "utf8"
        )
    );

    const factory = new ethers.ContractFactory(
        artifact.abi,
        artifact.bytecode,
        wallet
    );

    console.log("Deploying contract...");

    const contract = await factory.deploy(); // ← NO ARGUMENTS

    await contract.waitForDeployment();

    const addr = await contract.getAddress();

    console.log("====================================");
    console.log("✅ AUTHORITY DEPLOYED");
    console.log("Address:", addr);
    console.log("====================================");
}

main().catch(console.error);