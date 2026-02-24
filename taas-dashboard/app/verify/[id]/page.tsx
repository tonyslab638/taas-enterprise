"use client"

import { useEffect, useState } from "react"

export default function VerifyPage({ params }: { params: { id: string } }) {
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`http://localhost:5003/api/verify/${id}`)
        const json = await res.json()

        if (!json.success)
          throw new Error(json.error || "Verification failed")

        setData(json.product)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [id])

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Product Verification</h1>

        {loading && <p>Checking authenticity...</p>}

        {error && <p style={{ color: "red" }}>❌ {error}</p>}

        {data && (
          <>
            <p style={{ color: "lime", fontSize: 18 }}>
              ✅ Authentic Product
            </p>

            <div style={styles.info}>
              <p><b>ID:</b> {data.id}</p>
              <p><b>Brand:</b> {data.brand}</p>
              <p><b>Model:</b> {data.model}</p>
              <p><b>Category:</b> {data.category}</p>
              <p><b>Batch:</b> {data.batch}</p>
              <p><b>Created:</b> {new Date(data.createdAt).toLocaleString()}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles: any = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "black",
    color: "white"
  },
  card: {
    border: "1px solid #333",
    padding: 40,
    borderRadius: 12,
    width: 400,
    textAlign: "center",
    background: "#111"
  },
  title: {
    marginBottom: 20
  },
  info: {
    marginTop: 20,
    textAlign: "left"
  }
}