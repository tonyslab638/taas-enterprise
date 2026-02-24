"use client"

import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useSearchParams } from "next/navigation"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const sig = searchParams.get("sig")

  const [product, setProduct] = useState<any>(null)
  const [status, setStatus] = useState("Verifying...")
  const [wallet, setWallet] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !sig) return

    fetch(`http://localhost:5003/api/verify?id=${id}&sig=${sig}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setProduct(data.product)
          setStatus("VALID")
        } else {
          setStatus("INVALID")
        }
      })
      .catch(() => setStatus("ERROR"))
  }, [id, sig])

  async function connectWallet() {
    if (!(window as any).ethereum) {
      alert("Install MetaMask")
      return
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum)
    const accounts = await provider.send("eth_requestAccounts", [])
    setWallet(accounts[0])
  }

  async function secureClaim() {
    if (!wallet || !id) return

    const challengeRes = await fetch("http://localhost:5003/api/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet })
    })

    const challengeData = await challengeRes.json()
    const message = challengeData.message

    const provider = new ethers.BrowserProvider((window as any).ethereum)
    const signer = await provider.getSigner()
    const signature = await signer.signMessage(message)

    const claimRes = await fetch("http://localhost:5003/api/claim-secure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        wallet,
        signature
      })
    })

    const claimData = await claimRes.json()

    if (claimData.success) {
      alert("Ownership claimed securely!")
      location.reload()
    } else {
      alert("Claim failed")
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Product Verification</h1>

      <p>Status: {status}</p>

      {product && (
        <div>
          <h2>{product.brand}</h2>
          <p>ID: {product.id}</p>
          <p>Model: {product.model}</p>
          <p>Owner: {product.owner}</p>
          <p>Total Scans: {product.scans}</p>

          {!wallet ? (
            <button onClick={connectWallet}>
              Connect Wallet
            </button>
          ) : (
            <button onClick={secureClaim}>
              Claim Ownership Securely
            </button>
          )}
        </div>
      )}
    </div>
  )
}