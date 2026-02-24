import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { MongoClient } from "mongodb"

dotenv.config()

const app = express()
app.use(express.json())

/* =========================
   ENV CONFIG
========================= */

const PORT = process.env.PORT || 5003
const MONGO_URI = process.env.MONGO_URI
const JWT_SECRET = process.env.JWT_SECRET
const QR_SECRET = process.env.QR_SECRET
const ADMIN_WALLET = process.env.ADMIN_WALLET?.toLowerCase()
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:3000"

/* =========================
   CORS CONFIG
========================= */

app.use(
  cors({
    origin: ["http://localhost:3000", FRONTEND_URL],
    methods: ["GET", "POST"],
    credentials: true
  })
)

/* =========================
   DATABASE
========================= */

let db
let productsCollection

async function connectDB() {
  try {
    const client = new MongoClient(MONGO_URI)
    await client.connect()

    db = client.db("taas_enterprise")
    productsCollection = db.collection("products")

    console.log("✅ MongoDB Connected")
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message)
    process.exit(1)
  }
}

/* =========================
   UTILITIES
========================= */

function generateId(brand) {
  const random = Math.floor(10000000 + Math.random() * 90000000)
  return `${brand}-${random}`
}

function generateSignature(id) {
  return crypto
    .createHmac("sha256", QR_SECRET)
    .update(id)
    .digest("hex")
}

function verifySignature(id, sig) {
  const expected = generateSignature(id)
  return expected === sig
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ success: false, error: "No token" })
  }

  try {
    jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(403).json({ success: false, error: "Invalid token" })
  }
}

/* =========================
   ROUTES
========================= */

/* Health Check */
app.get("/", (req, res) => {
  res.json({ status: "TaaS Secure Enterprise API Live" })
})

/* Admin Authentication */
app.post("/auth", (req, res) => {
  const { wallet } = req.body

  if (!wallet || wallet.toLowerCase() !== ADMIN_WALLET) {
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized wallet" })
  }

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, {
    expiresIn: "7d"
  })

  res.json({ success: true, token })
})

/* Create Product */
app.post("/api/create", authenticateToken, async (req, res) => {
  try {
    const { brand, model, category, batch } = req.body

    if (!brand || !model || !category || !batch) {
      return res
        .status(400)
        .json({ success: false, error: "Missing fields" })
    }

    const id = generateId(brand)
    const signature = generateSignature(id)

    const product = {
      id,
      brand,
      model,
      category,
      batch,
      owner: ADMIN_WALLET,
      created: new Date(),
      scans: 0,
      fraudFlags: []
    }

    await productsCollection.insertOne(product)

    const verifyUrl = `${FRONTEND_URL}/verify?id=${id}&sig=${signature}`

    res.json({
      success: true,
      id,
      verifyUrl
    })
  } catch (err) {
    res.status(500).json({ success: false, error: "Create failed" })
  }
})

/* Verify Product */
app.get("/api/verify", async (req, res) => {
  try {
    const { id, sig } = req.query

    if (!id || !sig) {
      return res.json({ success: false, valid: false })
    }

    if (!verifySignature(id, sig)) {
      return res.json({
        success: true,
        valid: false,
        reason: "Invalid signature"
      })
    }

    const product = await productsCollection.findOne({ id })

    if (!product) {
      return res.json({
        success: true,
        valid: false,
        reason: "Product not found"
      })
    }

    /* Increment Scan Count */
    await productsCollection.updateOne(
      { id },
      { $inc: { scans: 1 } }
    )

    res.json({
      success: true,
      valid: true,
      product
    })
  } catch {
    res.status(500).json({ success: false, valid: false })
  }
})

/* =========================
   START SERVER
========================= */

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("🚀 TaaS Secure Enterprise Server Live")
    console.log(`🌐 Port: ${PORT}`)
  })
})