import React from "react"
import { Container } from "@platform/ui"

export default function HomePage() {
  return (
    <main className="py-12">
      <Container>
        <h1 className="text-4xl font-heading font-bold mb-4">Vanguard Industrial Wholesale</h1>
        <p className="text-lg text-brand-muted">
          Gated wholesale purchasing portal for verified corporate accounts.
        </p>
      </Container>
    </main>
  )
}
