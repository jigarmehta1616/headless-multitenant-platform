import React from "react"
import { cn } from "../utils.js"

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "narrow" | "full"
}

export function Container({ className, size = "default", ...props }: ContainerProps) {
  const sizes = {
    narrow: "max-w-4xl",
    default: "max-w-container",
    full: "max-w-full",
  }

  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizes[size], className)}
      {...props}
    />
  )
}
