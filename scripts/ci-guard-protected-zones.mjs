#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")

console.log("🛡️ Running Protected Zones Guard...")

// 1. Check all protected files have the mandatory review header
const protectedPatterns = [
  "packages/commerce/src",
  "apps/medusa/src/workflows",
  "apps/medusa/src/subscribers",
]

let headerViolations = 0
for (const relDir of protectedPatterns) {
  const fullDir = path.join(rootDir, relDir)
  if (!fs.existsSync(fullDir)) continue

  const files = getAllFiles(fullDir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8")
    if (!content.includes("DO NOT EDIT WITHOUT REVIEW")) {
      console.error(`❌ [Missing Protected Header]: ${path.relative(rootDir, file)}`)
      headerViolations++
    }
  }
}

// 2. Check safe zones (sections, content, landing) do NOT import private internals of protected zones
const safeZonePatterns = [
  "apps/storefront-b2c/src/sections",
  "apps/storefront-b2c/src/content",
  "apps/storefront-specialized/src/sections",
  "apps/storefront-b2b/src/sections",
]

let illegalImports = 0
for (const relDir of safeZonePatterns) {
  const fullDir = path.join(rootDir, relDir)
  if (!fs.existsSync(fullDir)) continue

  const files = getAllFiles(fullDir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8")
    // Safe zones should not directly import @medusajs/js-sdk or private files, only public @platform/commerce or @platform/ui
    if (content.includes("@medusajs/js-sdk") || content.includes("../../packages/commerce/src/client")) {
      console.error(`❌ [Illegal Protected Import in Safe Zone]: ${path.relative(rootDir, file)} imports protected internal`)
      illegalImports++
    }
  }
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath)
  for (const file of files) {
    const fullPath = path.join(dirPath, file)
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles)
    } else {
      arrayOfFiles.push(fullPath)
    }
  }
  return arrayOfFiles
}

if (headerViolations > 0 || illegalImports > 0) {
  console.error(`\n❌ Protected Zones Guard failed with ${headerViolations} header violations and ${illegalImports} illegal imports.`)
  process.exit(1)
} else {
  console.log("✅ Protected Zones Guard passed! All boundaries and review headers verified.")
}
