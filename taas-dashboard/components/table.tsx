import React from "react"

export function Table({ children }: any) {
  return (
    <table className="w-full border rounded-xl overflow-hidden">
      {children}
    </table>
  )
}