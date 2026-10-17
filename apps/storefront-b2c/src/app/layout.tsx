import React from "react"

export const metadata = {
  title: "Premium B2C Storefront",
  description: "Editorial luxury shopping experience powered by Medusa v2",
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
