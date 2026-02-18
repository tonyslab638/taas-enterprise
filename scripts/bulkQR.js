import fs from "fs"
import path from "path"
import QRCode from "qrcode"
import dotenv from "dotenv"

dotenv.config()

const PUBLIC_URL = process.env.PUBLIC_URL

if (!PUBLIC_URL) {
  throw new Error("❌ PUBLIC_URL missing in .env")
}

const ids = [
  "BATCH-1",
  "BATCH-2",
  "BATCH-3"
]

const outDir = "./qr-bulk"

if (!fs.existsSync(outDir))
  fs.mkdirSync(outDir)

async function run() {

  for (const id of ids) {

    const url = `${PUBLIC_URL}/verify.html?id=${id}`
    const file = path.join(outDir, `${id}.png`)

    await QRCode.toFile(file, url)

    console.log("✅ QR Generated:", id)
  }

  console.log("🚀 ALL QR CODES GENERATED")
}

run()