import { zodToJsonSchema } from "zod-to-json-schema"
import { ThemeConfigSchema } from "../src/schema.ts"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const schema = zodToJsonSchema(ThemeConfigSchema, "ThemeConfig")

const targetPath = path.resolve(__dirname, "../src/theme.schema.json")
fs.writeFileSync(targetPath, JSON.stringify(schema, null, 2), "utf-8")
console.log(`✅ JSON Schema generated at: ${targetPath}`)
