import React from "react"

export const metadata = {
  title: "Specialized B2C Storefront",
  description: "High-risk specialized tactical catalog with eligibility verification",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-surface text-brand-text font-body antialiased">
        {children}
      </body>
    </html>
  )
}
