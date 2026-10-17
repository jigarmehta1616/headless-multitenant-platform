import React from "react"

export const metadata = {
  title: "Gated B2B Wholesale Portal",
  description: "Enterprise procurement with contract pricing tiers and bulk orders",
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
