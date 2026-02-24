"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { ABI, CONTRACT_ADDRESS } from "@/lib/abi"

declare global {
  interface Window {
    ethereum?: any
  }
}

export default function CompanyDashboard() {
  const [wallet,setWallet] = useState("")
  const [companyId,setCompanyId] = useState<number | null>(null)
  const [status,setStatus] = useState("")
  const [roles,setRoles] = useState({
    factory:false,
    distributor:false,
    retailer:false
  })

  const [mintData,setMintData] = useState({
    brand:"",
    model:"",
    category:"",
    batch:"Batch-1"
  })

  const [verifyId,setVerifyId] = useState("")
  const [verifyResult,setVerifyResult] = useState<any>(null)

  const [transfer,setTransfer] = useState({
    id:"",
    to:""
  })

  async function getContract() {
    if(!window.ethereum) throw new Error("Install MetaMask")

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    return new ethers.Contract(CONTRACT_ADDRESS,ABI,signer)
  }

  async function connectWallet() {
    try{
      if(!window.ethereum) return alert("Install MetaMask")

      const accounts = await window.ethereum.request({ method:"eth_requestAccounts" })
      const address = accounts[0]
      setWallet(address)

      const contract = await getContract()

      const cid = await contract.walletCompany(address)
      const id = Number(cid)

      if(id === 0){
        setStatus("Wallet not registered to company")
        return
      }

      setCompanyId(id)

      const isFactory = await contract.factories(id,address)
      const isDistributor = await contract.distributors(id,address)
      const isRetailer = await contract.retailers(id,address)

      setRoles({
        factory:isFactory,
        distributor:isDistributor,
        retailer:isRetailer
      })

      setStatus("Connected")
    }catch(err:any){
      setStatus(err.message)
    }
  }

  async function mintProduct(){
    try{
      setStatus("Minting...")

      const contract = await getContract()

      const id = `ASJUJ-${Date.now()}`

      const tx = await contract.createProduct(
        id,
        mintData.brand,
        mintData.model,
        mintData.category,
        mintData.batch,
        wallet
      )

      await tx.wait()

      setStatus(`Minted: ${id}`)
    }catch(err:any){
      setStatus(err.reason || err.message)
    }
  }

  async function verifyProduct(){
    try{
      setStatus("Checking...")

      const contract = await getContract()

      const p = await contract.getProduct(verifyId)

      if(!p.id){
        setVerifyResult(null)
        setStatus("Not Found")
        return
      }

      setVerifyResult(p)
      setStatus("Valid Product")
    }catch{
      setVerifyResult(null)
      setStatus("Not Found")
    }
  }

  async function transferProduct(){
    try{
      setStatus("Transferring...")

      const contract = await getContract()

      const tx = await contract.transferProduct(
        transfer.id,
        transfer.to
      )

      await tx.wait()

      setStatus("Transferred")
    }catch(err:any){
      setStatus(err.reason || err.message)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-10 space-y-10">

      <h1 className="text-4xl font-bold text-center">
        ASJUJ GROUPS — Company Dashboard
      </h1>

      {/* CONNECT */}
      <div className="border p-6 rounded-xl space-y-3">
        <h2 className="text-xl font-semibold">Company Authentication</h2>

        {!wallet ? (
          <button
            onClick={connectWallet}
            className="px-6 py-2 bg-white text-black rounded-lg"
          >
            Connect Wallet
          </button>
        ):(
          <p className="text-green-400">{wallet}</p>
        )}
      </div>

      {/* MINT */}
      {roles.factory && (
      <div className="border p-6 rounded-xl space-y-3">
        <h2 className="text-xl font-semibold">Create Product</h2>

        <input
          placeholder="Brand"
          className="input"
          onChange={e=>setMintData({...mintData,brand:e.target.value})}
        />
        <input
          placeholder="Model"
          className="input"
          onChange={e=>setMintData({...mintData,model:e.target.value})}
        />
        <input
          placeholder="Category"
          className="input"
          onChange={e=>setMintData({...mintData,category:e.target.value})}
        />

        <button
          onClick={mintProduct}
          className="btn"
        >
          Mint Product
        </button>
      </div>
      )}

      {/* VERIFY */}
      <div className="border p-6 rounded-xl space-y-3">
        <h2 className="text-xl font-semibold">Verify Product</h2>

        <input
          placeholder="Product ID"
          className="input"
          onChange={e=>setVerifyId(e.target.value)}
        />

        <button onClick={verifyProduct} className="btn">
          Verify
        </button>

        {verifyResult && (
          <div className="bg-green-900 p-4 rounded">
            <p>ID: {verifyResult.id}</p>
            <p>Brand: {verifyResult.brand}</p>
            <p>Model: {verifyResult.model}</p>
            <p>Owner: {verifyResult.owner}</p>
          </div>
        )}
      </div>

      {/* TRANSFER */}
      {roles.distributor && (
      <div className="border p-6 rounded-xl space-y-3">
        <h2 className="text-xl font-semibold">Transfer Ownership</h2>

        <input
          placeholder="Product ID"
          className="input"
          onChange={e=>setTransfer({...transfer,id:e.target.value})}
        />

        <input
          placeholder="Receiver Wallet"
          className="input"
          onChange={e=>setTransfer({...transfer,to:e.target.value})}
        />

        <button onClick={transferProduct} className="btn">
          Transfer
        </button>
      </div>
      )}

      {/* STATUS */}
      <div className="text-center text-yellow-400 font-semibold">
        {status}
      </div>

      <style jsx>{`
        .input{
          width:100%;
          padding:10px;
          border-radius:8px;
          background:#111;
          border:1px solid #333;
        }
        .btn{
          padding:10px 20px;
          background:white;
          color:black;
          border-radius:8px;
          width:100%;
        }
      `}</style>

    </div>
  )
}