import express from "express"
import cors from "cors"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import "dotenv/config"
import { ethers } from "ethers"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

// ---------- ENV ----------
const RPC = process.env.RPC_URL
const CONTRACT = process.env.CONTRACT_ADDRESS
const PORT = process.env.PORT || 5000

if (!RPC) throw new Error("RPC_URL missing")
if (!CONTRACT) throw new Error("CONTRACT_ADDRESS missing")

// ---------- STATIC FILES ----------
app.use(express.static(path.join(__dirname, "../public")))

// ---------- BLOCKCHAIN ----------
const provider = new ethers.JsonRpcProvider(RPC)

const artifact = JSON.parse(
  fs.readFileSync("./artifacts/contracts/TaaSCore.sol/TaaSCore.json")
)

const contract = new ethers.Contract(CONTRACT, artifact.abi, provider)

// ---------- API ROUTE ----------
app.get("/product/:id", async (req, res) => {
  try {
    const data = await contract.getProduct(req.params.id)

    res.json({
      id: data[0],
      brand: data[1],
      model: data[2],
      category: data[3],
      factory: data[4],
      batch: data[5],
      owner: data[6],
      created: Number(data[7])
    })

  } catch (err) {
    res.status(404).json({
      error: "Product not found",
      details: err.reason || err.message
    })
  }
})

// ---------- SERVER ----------
app.listen(PORT, () => {
  console.log(`🚀 TaaS API running on port ${PORT}`)
})