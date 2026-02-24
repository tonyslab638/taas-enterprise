"use client"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    fetch("http://localhost:5003/api/admin/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <div className="p-10">Loading dashboard...</div>

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">TaaS Fraud Intelligence</h1>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-gray-100 rounded">
          <h2>Total Products</h2>
          <p className="text-2xl font-bold">{data.stats.totalProducts}</p>
        </div>

        <div className="p-6 bg-gray-100 rounded">
          <h2>Total Scans</h2>
          <p className="text-2xl font-bold">{data.stats.totalScans}</p>
        </div>

        <div className="p-6 bg-red-100 rounded">
          <h2>Suspicious Products</h2>
          <p className="text-2xl font-bold text-red-600">
            {data.stats.suspiciousCount}
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">High Risk Products</h2>
      {data.suspiciousProducts.map((p: any) => (
        <div key={p.id} className="p-4 border mb-3 rounded">
          <strong>{p.id}</strong> — Risk Score: {p.riskScore}
        </div>
      ))}
    </div>
  )
}