"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { ABI, CONTRACT_ADDRESS } from "@/lib/abi"

declare global {
  interface Window {
    ethereum?: any
  }
}

export default function Dashboard() {
  const [wallet, setWallet] = useState<string>("")
  const [companyName, setCompanyName] = useState("")
  const [companyId, setCompanyId] = useState("")
  const [roleWallet, setRoleWallet] = useState("")
  const [status, setStatus] = useState("Idle")

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Install MetaMask")
      return
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await provider.send("eth_requestAccounts", [])
    setWallet(accounts[0])
  }

  async function getContract() {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
  }

  async function createCompany() {
    try {
      setStatus("Creating company...")

      const contract = await getContract()
      const tx = await contract.createCompany(companyName, wallet)

      await tx.wait()

      setStatus("✅ Company Created")
    } catch (err: any) {
      console.error(err)
      setStatus("❌ " + (err.reason || err.message))
    }
  }

  async function addFactory() {
    try {
      setStatus("Adding factory...")

      const contract = await getContract()
      const tx = await contract.setFactory(companyId, roleWallet, true)

      await tx.wait()
      setStatus("✅ Factory Added")
    } catch (err: any) {
      setStatus("❌ " + (err.reason || err.message))
    }
  }

  async function addDistributor() {
    try {
      setStatus("Adding distributor...")

      const contract = await getContract()
      const tx = await contract.setDistributor(companyId, roleWallet, true)

      await tx.wait()
      setStatus("✅ Distributor Added")
    } catch (err: any) {
      setStatus("❌ " + (err.reason || err.message))
    }
  }

  async function addRetailer() {
    try {
      setStatus("Adding retailer...")

      const contract = await getContract()
      const tx = await contract.setRetailer(companyId, roleWallet, true)

      await tx.wait()
      setStatus("✅ Retailer Added")
    } catch (err: any) {
      setStatus("❌ " + (err.reason || err.message))
    }
  }

  async function togglePause() {
    try {
      setStatus("Updating contract state...")

      const contract = await getContract()
      const tx = await contract.setPause(true)

      await tx.wait()
      setStatus("⏸ Contract Paused")
    } catch (err: any) {
      setStatus("❌ " + (err.reason || err.message))
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-10 space-y-10">

      <h1 className="text-4xl font-bold text-center">
        ASJUJ SUPER ADMIN PANEL
      </h1>

      {/* Wallet */}
      <div className="border p-6 rounded-xl space-y-4">
        <h2 className="text-xl font-semibold">Connect Admin Wallet</h2>
        <button
          onClick={connectWallet}
          className="bg-white text-black px-6 py-2 rounded"
        >
          Connect
        </button>
        <p>{wallet}</p>
      </div>

      {/* Create Company */}
      <div className="border p-6 rounded-xl space-y-4">
        <h2 className="text-xl font-semibold">Create Company</h2>

        <input
          className="w-full p-2 text-black"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />

        <button
          onClick={createCompany}
          className="bg-green-500 px-6 py-2 rounded"
        >
          Create
        </button>
      </div>

      {/* Role Management */}
      <div className="border p-6 rounded-xl space-y-4">
        <h2 className="text-xl font-semibold">Role Management</h2>

        <input
          className="w-full p-2 text-black"
          placeholder="Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        />

        <input
          className="w-full p-2 text-black"
          placeholder="Wallet Address"
          value={roleWallet}
          onChange={(e) => setRoleWallet(e.target.value)}
        />

        <div className="flex gap-3 flex-wrap">
          <button onClick={addFactory} className="bg-blue-500 px-4 py-2 rounded">
            Add Factory
          </button>

          <button onClick={addDistributor} className="bg-purple-500 px-4 py-2 rounded">
            Add Distributor
          </button>

          <button onClick={addRetailer} className="bg-orange-500 px-4 py-2 rounded">
            Add Retailer
          </button>
        </div>
      </div>

      {/* Pause */}
      <div className="border p-6 rounded-xl space-y-4">
        <h2 className="text-xl font-semibold">Platform Control</h2>

        <button
          onClick={togglePause}
          className="bg-red-600 px-6 py-2 rounded"
        >
          Toggle Pause
        </button>
      </div>

      {/* Status */}
      <div className="border p-6 rounded-xl">
        <b>Status:</b> {status}
      </div>
    </div>
  )
}