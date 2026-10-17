import React from "react"
import { Container } from "@platform/ui"

export default function HomePage() {
  return (
    <main className="py-12">
      <Container>
        <h1 className="text-4xl font-heading font-bold mb-4">Aurora Luxury Collection</h1>
        <p className="text-lg text-brand-muted">
          Decoupled headless storefront powered by Medusa v2 native multi-tenancy.
        </p>
      </Container>
    </main>
  )
}
