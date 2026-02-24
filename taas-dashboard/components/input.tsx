"use client"
import React from "react"
import { cn } from "@/lib/utils"

export default function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={cn(
        "border rounded-xl px-3 py-2 w-full outline-none focus:ring-2 focus:ring-black",
        props.className
      )}
    />
  )
}