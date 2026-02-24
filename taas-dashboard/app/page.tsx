"use client"

import { useState } from "react"

const API = "http://localhost:5003"

export default function Page() {
  const [wallet, setWallet] = useState("")
  const [status, setStatus] = useState("Idle")

  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [category, setCategory] = useState("")
  const [batch, setBatch] = useState("")

  async function connectWallet() {
    try {
      if (!window.ethereum) return alert("Install MetaMask")

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      })

      setWallet(accounts[0])
      setStatus("Wallet Connected")

      // auto fetch JWT
      const res = await fetch(`${API}/auth`)
      const data = await res.json()

      localStorage.setItem("token", data.token)

      setStatus("Authenticated")
    } catch (err) {
      setStatus("Wallet connection failed")
    }
  }

  async function mint() {
    try {
      setStatus("Minting...")

      const token = localStorage.getItem("token")

      const res = await fetch(`${API}/api/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ brand, model, category, batch })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setStatus("✅ Product Minted ID: " + data.product.id)
    } catch (err:any) {
      setStatus("❌ " + err.message)
    }
  }

  return (
    <div style={{padding:40,fontFamily:"sans-serif"}}>
      <h1>ASJUJ GROUPS</h1>
      <p>Product Truth Infrastructure</p>

      <hr/>

      <h2>Company Authentication</h2>
      <button onClick={connectWallet}>Connect Wallet</button>
      <p>{wallet}</p>

      <hr/>

      <h2>Create Product Identity</h2>

      <input placeholder="Brand" onChange={e=>setBrand(e.target.value)} /><br/>
      <input placeholder="Model" onChange={e=>setModel(e.target.value)} /><br/>
      <input placeholder="Category" onChange={e=>setCategory(e.target.value)} /><br/>
      <input placeholder="Batch" onChange={e=>setBatch(e.target.value)} /><br/>

      <button onClick={mint}>Mint Product</button>

      <hr/>

      <h2>Status</h2>
      <p>{status}</p>
    </div>
  )
}