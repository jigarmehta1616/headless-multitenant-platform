import React from "react"
import { Container } from "@platform/ui"

export default function HomePage() {
  return (
    <main className="py-12">
      <Container>
        <h1 className="text-4xl font-heading font-bold mb-4">Apex Tactical Gear</h1>
        <p className="text-lg text-brand-muted">
          High-performance tactical gear with automated compliance checks and age gating.
        </p>
      </Container>
    </main>
  )
}
