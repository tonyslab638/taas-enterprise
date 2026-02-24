"use client"
import React, { useState } from "react"

export default function Dropdown({
  label,
  items
}: {
  label: string
  items: string[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 border rounded-xl"
      >
        {label}
      </button>

      {open && (
        <div className="absolute mt-2 bg-white border rounded-xl shadow w-40">
          {items.map(i => (
            <div
              key={i}
              className="px-3 py-2 hover:bg-zinc-100 cursor-pointer"
            >
              {i}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}