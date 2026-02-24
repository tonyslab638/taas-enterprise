import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import QRCode from "qrcode"
import { MongoClient } from "mongodb"
import { ethers } from "ethers"

dotenv.config()

/* ================= ENV ================= */

const {
  PORT = 5003,
  MONGO_URI,
  JWT_SECRET,
  QR_SECRET,
  ADMIN_WALLET
} = process.env

if (!MONGO_URI || !JWT_SECRET || !QR_SECRET || !ADMIN_WALLET) {
  console.error("❌ Missing required ENV variables")
  process.exit(1)
}

/* ================= APP INIT ================= */

const app = express()

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json())

/* ================= DATABASE ================= */

let db

async function connectDB() {
  try {
    const client = new MongoClient(MONGO_URI)
    await client.connect()
    db = client.db("taas_enterprise")
    console.log("✅ MongoDB Connected")
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message)
    process.exit(1)
  }
}

/* ================= HELPERS ================= */

function generateProductId() {
  const random = Math.floor(10000000 + Math.random() * 90000000)
  return `ASJUJ-${random}`
}

function generateSignature(id) {
  return crypto
    .createHmac("sha256", QR_SECRET)
    .update(id)
    .digest("hex")
}

function generateNonce() {
  return crypto.randomBytes(16).toString("hex")
}

function verifyAdmin(req) {
  const header = req.headers.authorization
  if (!header) return false
  try {
    const token = header.split(" ")[1]
    jwt.verify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.json({ success: true, message: "TaaS Enterprise Secure API Live" })
})

/* ================= AUTH ================= */

app.post("/auth", (req, res) => {
  const { wallet } = req.body
  if (!wallet) return res.json({ success: false })

  if (wallet.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
    return res.json({ success: false, error: "Unauthorized wallet" })
  }

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, {
    expiresIn: "7d"
  })

  res.json({ success: true, token })
})

/* ================= CREATE PRODUCT ================= */

app.post("/api/create", async (req, res) => {
  if (!verifyAdmin(req))
    return res.status(401).json({ success: false })

  const { brand, model, category, batch } = req.body
  if (!brand || !model || !category || !batch)
    return res.json({ success: false, error: "Missing fields" })

  const id = generateProductId()
  const sig = generateSignature(id)

  const verifyUrl = `http://localhost:3000/verify?id=${id}&sig=${sig}`
  const qr = await QRCode.toDataURL(verifyUrl)

  const product = {
    id,
    brand,
    model,
    category,
    batch,
    owner: ADMIN_WALLET,
    ownershipHistory: [],
    scans: 0,
    scanHistory: [],
    riskScore: 0,
    suspicious: false,
    created: new Date()
  }

  await db.collection("products").insertOne(product)

  res.json({ success: true, id, verifyUrl, qr })
})

/* ================= VERIFY + FRAUD ENGINE ================= */

app.get("/api/verify", async (req, res) => {
  const { id, sig } = req.query
  if (!id || !sig) return res.json({ success: false })

  if (generateSignature(id) !== sig)
    return res.json({ success: true, valid: false })

  const product = await db.collection("products").findOne({ id })
  if (!product)
    return res.json({ success: true, valid: false })

  const now = new Date()
  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "unknown"

  const newScan = { ip, time: now }

  const updatedHistory = [...(product.scanHistory || []), newScan]

  let riskScore = product.riskScore || 0
  let suspicious = false

  // Fraud Rule 1: Rapid Scans
  const fiveMinAgo = new Date(now.getTime() - 5 * 60000)
  const recentScans = updatedHistory.filter(
    s => new Date(s.time) > fiveMinAgo
  )
  if (recentScans.length > 5) riskScore++

  // Fraud Rule 2: Multiple IPs
  const uniqueIPs = new Set(updatedHistory.map(s => s.ip))
  if (uniqueIPs.size > 3) riskScore++

  // Fraud Rule 3: High Total Scans
  if (updatedHistory.length > 20) riskScore++

  if (riskScore >= 3) suspicious = true

  await db.collection("products").updateOne(
    { id },
    {
      $set: {
        scanHistory: updatedHistory,
        riskScore,
        suspicious
      },
      $inc: { scans: 1 }
    }
  )

  res.json({
    success: true,
    valid: true,
    suspicious,
    riskScore,
    product: {
      id: product.id,
      brand: product.brand,
      model: product.model,
      category: product.category,
      owner: product.owner,
      scans: (product.scans || 0) + 1,
      riskScore,
      suspicious,
      created: product.created
    }
  })
})

/* ================= WALLET CHALLENGE ================= */

app.post("/api/challenge", async (req, res) => {
  const { wallet } = req.body
  if (!wallet) return res.json({ success: false })

  const nonce = generateNonce()

  await db.collection("nonces").updateOne(
    { wallet },
    { $set: { nonce } },
    { upsert: true }
  )

  const message = `TaaS Ownership Verification\nNonce: ${nonce}`
  res.json({ success: true, message })
})

/* ================= SECURE CLAIM ================= */

app.post("/api/claim-secure", async (req, res) => {
  const { id, wallet, signature } = req.body
  if (!id || !wallet || !signature)
    return res.json({ success: false })

  const nonceRecord = await db.collection("nonces").findOne({ wallet })
  if (!nonceRecord)
    return res.json({ success: false, error: "Nonce not found" })

  const message = `TaaS Ownership Verification\nNonce: ${nonceRecord.nonce}`
  const recovered = ethers.verifyMessage(message, signature)

  if (recovered.toLowerCase() !== wallet.toLowerCase())
    return res.json({ success: false, error: "Invalid signature" })

  const product = await db.collection("products").findOne({ id })
  if (!product)
    return res.json({ success: false })

  await db.collection("products").updateOne(
    { id },
    {
      $set: { owner: wallet },
      $push: {
        ownershipHistory: {
          from: product.owner,
          to: wallet,
          date: new Date()
        }
      }
    }
  )

  await db.collection("nonces").deleteOne({ wallet })

  res.json({ success: true, message: "Ownership claimed securely" })
})

/* ================= ADMIN DASHBOARD ================= */

app.get("/api/admin/dashboard", async (req, res) => {
  if (!verifyAdmin(req))
    return res.status(401).json({ success: false })

  const totalProducts = await db.collection("products").countDocuments()

  const totalScansAgg = await db.collection("products").aggregate([
    { $group: { _id: null, total: { $sum: "$scans" } } }
  ]).toArray()

  const totalScans = totalScansAgg[0]?.total || 0

  const suspiciousProducts = await db.collection("products")
    .find({ suspicious: true })
    .sort({ riskScore: -1 })
    .limit(10)
    .toArray()

  res.json({
    success: true,
    stats: {
      totalProducts,
      totalScans,
      suspiciousCount: suspiciousProducts.length
    },
    suspiciousProducts
  })
})

/* ================= START SERVER ================= */

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("\n🚀 TaaS Secure Enterprise Server Live")
    console.log("🌐 Port:", PORT)
    console.log("📦 Database: Connected\n")
  })
})