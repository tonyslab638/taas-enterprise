/**
 * TAAS QR GENERATOR
 * Generates QR code for product verification
 */

import QRCode from "qrcode"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

dotenv.config()

// ================= CONFIG =================

const BASE_URL =
  process.env.PUBLIC_URL ||
  "http://localhost:5000"

// ================= INPUT =================

const id = process.argv[2]

if (!id) {
  console.log("❌ Please provide product ID")
  console.log("Usage: node scripts/generateQR.js PRODUCT_ID")
  process.exit(1)
}

// ================= URL =================

const verifyURL = `${BASE_URL}/verify.html?id=${id}`

// ================= OUTPUT FOLDER =================

const outputDir = path.join(process.cwd(), "qr")

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir)
}

// ================= FILE PATH =================

const filePath = path.join(outputDir, `${id}.png`)

// ================= GENERATE QR =================

QRCode.toFile(filePath, verifyURL, {
  width: 400,
  margin: 2,
  color: {
    dark: "#000000",
    light: "#ffffff"
  }
})
.then(() => {
  console.log("✅ QR GENERATED SUCCESSFULLY")
  console.log("Product ID:", id)
  console.log("QR URL:", verifyURL)
  console.log("Saved to:", filePath)
})
.catch(err => {
  console.error("❌ QR generation failed")
  console.error(err)
})