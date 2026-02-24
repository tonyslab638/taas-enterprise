import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const app = express()

/* =========================
   ENV VALIDATION
========================= */

const {
  MONGO_URI,
  JWT_SECRET,
  QR_SECRET,
  ADMIN_WALLET,
  FRONTEND_URL,
  PORT
} = process.env

if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing")
  process.exit(1)
}

if (!JWT_SECRET || !QR_SECRET || !ADMIN_WALLET) {
  console.error("❌ Required environment variables missing")
  process.exit(1)
}

/* =========================
   MONGODB CONNECTION
========================= */

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
})
.then(() => {
  console.log("✅ MongoDB Connected")
})
.catch((err) => {
  console.error("❌ MongoDB Connection Failed:", err.message)
  process.exit(1)
})

/* =========================
   MONGOOSE MODEL
========================= */

const productSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  brand: String,
  model: String,
  category: String,
  batch: String,
  owner: String,
  created: Date,
  scans: { type: Number, default: 0 },
  fraudFlags: { type: [String], default: [] }
})

const Product = mongoose.model("Product", productSchema)

/* =========================
   CORS CONFIGURATION
========================= */

const allowedOrigins = [
  "http://localhost:3000",
  "https://taas-enterprise.vercel.app"
]

if (FRONTEND_URL) {
  allowedOrigins.push(FRONTEND_URL)
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("CORS not allowed"))
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}))

app.use(express.json())

/* =========================
   HELPER FUNCTIONS
========================= */

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
  if (!authHeader) return res.status(401).json({ success: false })

  const token = authHeader.split(" ")[1]

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false })
    req.user = user
    next()
  })
}

/* =========================
   ROUTES
========================= */

app.get("/", (req, res) => {
  res.json({ status: "TaaS Enterprise API Live" })
})

/* === ADMIN AUTH === */

app.post("/auth", (req, res) => {
  const { wallet } = req.body

  if (!wallet || wallet.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
    return res.status(401).json({ success: false })
  }

  const token = jwt.sign(
    { role: "admin" },
    JWT_SECRET,
    { expiresIn: "7d" }
  )

  res.json({ success: true, token })
})

/* === CREATE PRODUCT === */

app.post("/api/create", authenticateToken, async (req, res) => {
  try {
    const { brand, model, category, batch } = req.body

    const id = `${brand}-${Math.floor(Math.random() * 100000000)}`
    const signature = generateSignature(id)

    const newProduct = await Product.create({
      id,
      brand,
      model,
      category,
      batch,
      owner: ADMIN_WALLET,
      created: new Date(),
      scans: 0
    })

    const verifyUrl = `${FRONTEND_URL}/verify?id=${id}&sig=${signature}`

    res.json({
      success: true,
      id,
      verifyUrl
    })

  } catch (err) {
    console.error("Create error:", err.message)
    res.status(500).json({ success: false })
  }
})

/* === VERIFY PRODUCT === */

app.get("/api/verify", async (req, res) => {
  try {
    const { id, sig } = req.query

    if (!id || !sig) {
      return res.json({ success: false, valid: false })
    }

    if (!verifySignature(id, sig)) {
      return res.json({ success: false, valid: false })
    }

    const product = await Product.findOne({ id })

    if (!product) {
      return res.json({ success: false, valid: false })
    }

    product.scans += 1
    await product.save()

    res.json({
      success: true,
      valid: true,
      product
    })

  } catch (err) {
    console.error("Verify error:", err.message)
    res.status(500).json({ success: false })
  }
})

/* =========================
   START SERVER
========================= */

const serverPort = PORT || 5003

app.listen(serverPort, () => {
  console.log("🚀 TaaS Secure Enterprise Server Live")
  console.log(`🌐 Port: ${serverPort}`)
})