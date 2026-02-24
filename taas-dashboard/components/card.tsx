import React from "react"
import { cn } from "@/lib/utils"

export function Card({ className, ...props }: any) {
  return (
    <div
      className={cn(
        "bg-white border rounded-2xl p-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}