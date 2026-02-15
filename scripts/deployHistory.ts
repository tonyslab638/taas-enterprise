import { ethers } from "ethers"
import * as dotenv from "dotenv"
dotenv.config()

async function main() {

    const RPC = process.env.SEPOLIA_RPC_URL
    const KEY = process.env.PRIVATE_KEY
    const CORE = process.env.CONTRACT_ADDRESS

    if (!RPC || !KEY || !CORE) {
        throw new Error("ENV missing → check .env file")
    }

    console.log("Using Core:", CORE)

    const provider = new ethers.JsonRpcProvider(RPC)
    const wallet = new ethers.Wallet(KEY, provider)

    const artifact = await import("../artifacts/contracts/TaaSOwnershipHistory.sol/TaaSOwnershipHistory.json", {
        with: { type: "json" }
    })

    const factory = new ethers.ContractFactory(
        artifact.default.abi,
        artifact.default.bytecode,
        wallet
    )

    console.log("Deploying history contract...")

    const contract = await factory.deploy(CORE)

    await contract.waitForDeployment()

    console.log("\n==============================")
    console.log("✅ HISTORY DEPLOYED")
    console.log(await contract.getAddress())
    console.log("==============================\n")
}

main().catch(console.error)