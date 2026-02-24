"use client"

import { useState } from "react"

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://taas-api-1nxo.onrender.com"

export default function Home() {
  const [wallet, setWallet] = useState("")
  const [token, setToken] = useState("")
  const [status, setStatus] = useState("")
  const [verifyUrl, setVerifyUrl] = useState("")
  const [brand, setBrand] = useState("ASJUJ")
  const [model, setModel] = useState("")
  const [category, setCategory] = useState("")
  const [batch, setBatch] = useState("")

  async function authenticate() {
    setStatus("Authenticating...")

    try {
      const res = await fetch(`${API_BASE}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet })
      })

      if (!res.ok) throw new Error()

      const data = await res.json()
      setToken(data.token)
      setStatus("✅ Admin Authenticated")
    } catch {
      setStatus("❌ Authentication Failed")
    }
  }

  async function createProduct() {
    if (!token) {
      setStatus("❌ Authenticate First")
      return
    }

    setStatus("Creating product...")
    setVerifyUrl("")

    try {
      const res = await fetch(`${API_BASE}/api/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          brand,
          model,
          category,
          batch
        })
      })

      if (!res.ok) throw new Error()

      const data = await res.json()

      setStatus(`✅ Product Created: ${data.id}`)
      setVerifyUrl(data.verifyUrl)
    } catch {
      setStatus("❌ Product Creation Failed")
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 600 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 30 }}>
        TaaS Enterprise Dashboard
      </h1>

      {/* Admin Auth */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, marginBottom: 10 }}>
          Admin Authentication
        </h2>

        <input
          placeholder="Admin Wallet"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <button
          onClick={authenticate}
          style={{
            width: "100%",
            padding: 10,
            background: "black",
            color: "white",
            cursor: "pointer"
          }}
        >
          Authenticate Admin
        </button>
      </div>

      {/* Product Creation */}
      <div>
        <h2 style={{ fontSize: 20, marginBottom: 10 }}>
          Create Product
        </h2>

        <input
          placeholder="Brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <input
          placeholder="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <input
          placeholder="Batch"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <button
          onClick={createProduct}
          style={{
            width: "100%",
            padding: 10,
            background: "green",
            color: "white",
            cursor: "pointer"
          }}
        >
          Create Product
        </button>
      </div>

      {/* Status */}
      <div style={{ marginTop: 30, fontWeight: "bold" }}>
        {status}
      </div>

      {/* Verify Link */}
      {verifyUrl && (
        <div style={{ marginTop: 20 }}>
          <p><strong>Verify Link:</strong></p>
          <a
            href={verifyUrl}
            target="_blank"
            style={{ color: "blue", wordBreak: "break-all" }}
          >
            {verifyUrl}
          </a>
        </div>
      )}
    </div>
  )
}