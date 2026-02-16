import { ethers } from "ethers"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()

async function main(){

 const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL)
 const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)

 const artifact = JSON.parse(
  fs.readFileSync("./artifacts/contracts/TaaSSeal.sol/TaaSSeal.json","utf8")
 )

 const factory = new ethers.ContractFactory(
  artifact.abi,
  artifact.bytecode,
  wallet
 )

 console.log("Deploying Seal Engine...")

 const contract = await factory.deploy()
 await contract.waitForDeployment()

 console.log("=================================")
 console.log("🛡 SEAL ENGINE DEPLOYED")
 console.log(await contract.getAddress())
 console.log("=================================")
}

main().catch(console.error)