import React from "react"
import { cn } from "../utils.js"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean
}

export function Card({ className, bordered = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-brand-surface p-6 shadow-sm",
        bordered && "border border-brand-border",
        className
      )}
      {...props}
    />
  )
}
