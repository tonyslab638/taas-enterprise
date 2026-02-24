"use client"

import { useEffect, useState } from "react"

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://taas-api-1nxo.onrender.com"

export default function VerifyPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id")
    const sig = params.get("sig")

    if (!id || !sig) {
      setLoading(false)
      setData({ valid: false })
      return
    }

    fetch(`${API_BASE}/api/verify?id=${id}&sig=${sig}`)
      .then((res) => res.json())
      .then((result) => {
        setData(result)
        setLoading(false)
      })
      .catch(() => {
        setData({ valid: false })
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div style={{ padding: 40 }}>🔍 Verifying product...</div>
  }

  if (!data || !data.valid) {
    return (
      <div style={{ padding: 40, color: "red", fontWeight: "bold" }}>
        ❌ INVALID PRODUCT
      </div>
    )
  }

  const product = data.product

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ color: "green" }}>✅ AUTHENTIC PRODUCT</h1>

      <p><strong>ID:</strong> {product.id}</p>
      <p><strong>Brand:</strong> {product.brand}</p>
      <p><strong>Model:</strong> {product.model}</p>
      <p><strong>Category:</strong> {product.category}</p>
      <p><strong>Owner:</strong> {product.owner}</p>
      <p><strong>Total Scans:</strong> {product.totalScans}</p>
    </div>
  )
}