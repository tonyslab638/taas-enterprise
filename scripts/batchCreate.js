import { ethers } from "ethers"
import dotenv from "dotenv"
import fs from "fs"

dotenv.config()

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

const artifact = JSON.parse(
  fs.readFileSync("./artifacts/contracts/TaaSCore.sol/TaaSCore.json")
)

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  artifact.abi,
  wallet
)

async function run() {

  const products = [
    { id:"BATCH-1", brand:"ASJUJ", model:"Titan", category:"Electronics", factory:"F1", batch:"A" },
    { id:"BATCH-2", brand:"ASJUJ", model:"Nova", category:"Electronics", factory:"F1", batch:"A" },
    { id:"BATCH-3", brand:"ASJUJ", model:"Phantom", category:"Electronics", factory:"F2", batch:"B" }
  ]

  for (const p of products) {

    console.log("Creating:", p.id)

    const tx = await contract.createProduct(
      p.id,
      p.brand,
      p.model,
      p.category,
      p.factory,
      p.batch,
      wallet.address
    )

    await tx.wait()
    console.log("✅ Created:", p.id)
  }

  console.log("🚀 Batch Completed")
}

run()