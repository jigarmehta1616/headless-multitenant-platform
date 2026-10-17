import React from "react"
import { cn } from "../utils.js"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-brand-text mb-1"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            "flex h-10 w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-brand-error focus-visible:ring-brand-error",
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-brand-error">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="mt-1 text-xs text-brand-muted">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
