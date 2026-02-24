import React from "react"
import { cn } from "@/lib/utils"

export default function Badge({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "px-3 py-1 text-xs rounded-full bg-black text-white font-semibold",
        className
      )}
    >
      {children}
    </span>
  )
}