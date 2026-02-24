import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   ENVIRONMENT VARIABLES CHECK
================================ */

const {
  MONGO_URI,
  JWT_SECRET,
  QR_SECRET,
  ADMIN_WALLET,
  PORT
} = process.env;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing");
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET missing");
  process.exit(1);
}

if (!QR_SECRET) {
  console.error("❌ QR_SECRET missing");
  process.exit(1);
}

/* ===============================
   DATABASE CONNECTION
================================ */

let db;

async function connectDB() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db("taas");
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
}

await connectDB();

/* ===============================
   UTILITIES
================================ */

function generateProductId() {
  const random = Math.floor(10000000 + Math.random() * 90000000);
  return `ASJUJ-${random}`;
}

function signQR(id) {
  return crypto
    .createHmac("sha256", QR_SECRET)
    .update(id)
    .digest("hex");
}

function verifyQR(id, sig) {
  const expected = signQR(id);
  return expected === sig;
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
}

/* ===============================
   HEALTH CHECK
================================ */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TaaS Enterprise Secure API Live"
  });
});

/* ===============================
   AUTH
================================ */

app.post("/auth", (req, res) => {
  const { wallet } = req.body;

  if (!wallet) {
    return res.json({ success: false, error: "Wallet required" });
  }

  if (wallet.toLowerCase() !== ADMIN_WALLET?.toLowerCase()) {
    return res.json({ success: false, error: "Unauthorized wallet" });
  }

  const token = jwt.sign(
    { role: "admin", wallet },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ success: true, token });
});

/* ===============================
   CREATE PRODUCT
================================ */

app.post("/api/create", authMiddleware, async (req, res) => {
  try {
    const { brand, model, category, batch } = req.body;

    if (!brand || !model || !category || !batch) {
      return res.json({ success: false, error: "Missing fields" });
    }

    const id = generateProductId();
    const sig = signQR(id);

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
    };

    await db.collection("products").insertOne(product);

    const verifyUrl = `${req.protocol}://${req.get("host")}/api/verify?id=${id}&sig=${sig}`;

    res.json({
      success: true,
      id,
      verifyUrl
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===============================
   VERIFY PRODUCT
================================ */

app.get("/api/verify", async (req, res) => {
  try {
    const { id, sig } = req.query;

    if (!id || !sig) {
      return res.json({ success: false, valid: false });
    }

    if (!verifyQR(id, sig)) {
      return res.json({
        success: true,
        valid: false,
        reason: "Invalid signature"
      });
    }

    const product = await db.collection("products").findOne({ id });

    if (!product) {
      return res.json({ success: true, valid: false });
    }

    // Increase scan count
    await db.collection("products").updateOne(
      { id },
      { $inc: { scans: 1 } }
    );

    res.json({
      success: true,
      valid: true,
      product
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===============================
   CLAIM OWNERSHIP
================================ */

app.post("/api/claim", async (req, res) => {
  try {
    const { id, wallet } = req.body;

    if (!id || !wallet) {
      return res.json({ success: false, error: "Missing fields" });
    }

    const product = await db.collection("products").findOne({ id });

    if (!product) {
      return res.json({ success: false, error: "Not found" });
    }

    if (product.owner !== ADMIN_WALLET) {
      return res.json({ success: false, error: "Already claimed" });
    }

    await db.collection("products").updateOne(
      { id },
      { $set: { owner: wallet } }
    );

    res.json({ success: true, message: "Ownership claimed" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===============================
   TRANSFER OWNERSHIP
================================ */

app.post("/api/transfer", async (req, res) => {
  try {
    const { id, fromWallet, toWallet } = req.body;

    if (!id || !fromWallet || !toWallet) {
      return res.json({ success: false, error: "Missing fields" });
    }

    const product = await db.collection("products").findOne({ id });

    if (!product) {
      return res.json({ success: false, error: "Not found" });
    }

    if (product.owner.toLowerCase() !== fromWallet.toLowerCase()) {
      return res.json({ success: false, error: "Not owner" });
    }

    await db.collection("products").updateOne(
      { id },
      { $set: { owner: toWallet } }
    );

    res.json({ success: true, message: "Ownership transferred" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===============================
   START SERVER
================================ */

const serverPort = PORT || 5003;

app.listen(serverPort, () => {
  console.log("🚀 TaaS Secure Enterprise Server Live");
  console.log("🌐 Port:", serverPort);
});