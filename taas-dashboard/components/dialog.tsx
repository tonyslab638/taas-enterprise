"use client"
import React from "react"

export default function Dialog({
  open,
  children
}: {
  open: boolean
  children: React.ReactNode
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        {children}
      </div>
    </div>
  )
}