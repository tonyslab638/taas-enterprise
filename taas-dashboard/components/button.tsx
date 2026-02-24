"use client"
import React from "react"
import { cn } from "@/lib/utils"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger"
}

export default function Button({
  className,
  variant = "primary",
  ...props
}: Props) {
  const styles = {
    primary: "bg-black text-white hover:bg-zinc-800",
    secondary: "bg-zinc-200 hover:bg-zinc-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }

  return (
    <button
      className={cn(
        "px-4 py-2 rounded-xl font-semibold transition",
        styles[variant],
        className
      )}
      {...props}
    />
  )
}