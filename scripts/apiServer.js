// =============================
// TaaS API SERVER — CLEAN BUILD
// =============================

require("dotenv").config()
const express = require("express")
const { ethers } = require("ethers")
const fs = require("fs")
const path = require("path")

// =============================
// CONFIG
// =============================

const PORT = process.env.PORT || 4000
const RPC = process.env.SEPOLIA_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS

if (!RPC || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.log("❌ Missing ENV values")
    process.exit(1)
}

// =============================
// PROVIDER + WALLET
// =============================

const provider = new ethers.JsonRpcProvider(RPC)
const wallet = new ethers.Wallet(PRIVATE_KEY, provider)

// =============================
// LOAD ABI (SAFE)
// =============================

const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/TaaSCore.sol/TaaSCore.json"
)

if (!fs.existsSync(artifactPath)) {
    console.log("❌ ABI FILE NOT FOUND")
    process.exit(1)
}

const artifact = JSON.parse(fs.readFileSync(artifactPath))
const abi = artifact.abi

// =============================
// CONTRACT
// =============================

const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet)

// =============================
// EXPRESS APP
// =============================

const app = express()

app.use(express.json())

// =============================
// HOME PAGE
// =============================

app.get("/", (req, res) => {
    res.send(`
    <h1>🔎 TaaS Product Verification</h1>
    <form action="/verify" method="get">
        <input name="id" placeholder="Enter Product ID"/>
        <button>Verify</button>
    </form>
    `)
})

// =============================
// VERIFY ROUTE
// =============================

app.get("/verify", async (req, res) => {
    try {
        const id = req.query.id

        if (!id) return res.send("Missing product id")

        const data = await contract.getProduct(id)

        res.send(`
        <h2>✅ Product Verified</h2>
        <p><b>ID:</b> ${data[0]}</p>
        <p><b>Brand:</b> ${data[1]}</p>
        <p><b>Model:</b> ${data[2]}</p>
        <p><b>Category:</b> ${data[3]}</p>
        <p><b>Factory:</b> ${data[4]}</p>
        <p><b>Batch:</b> ${data[5]}</p>
        <p><b>Owner:</b> ${data[6]}</p>
        <p><b>Created:</b> ${new Date(Number(data[7]) * 1000).toLocaleString()}</p>
        `)
    } catch (err) {
        res.send("❌ Product not found")
    }
})

// =============================
// API ROUTE
// =============================

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
            created: data[7].toString()
        })
    } catch {
        res.status(404).json({ error: "NOT_FOUND" })
    }
})

// =============================
// SAFE SERVER START
// =============================

const server = app.listen(PORT, () => {
    console.log(`🚀 TaaS API running at http://localhost:${PORT}`)
})

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.log(`⚠️ Port ${PORT} already running`)
        console.log(`Kill process or change PORT in .env`)
    } else {
        console.log(err)
    }
})