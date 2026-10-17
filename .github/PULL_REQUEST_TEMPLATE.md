## Description
Briefly describe the business requirement, bug fix, or feature.

## Linear Issue
Closes ENG-XXXX / [Issue Key]

## Type of Change
- [ ] Safe Zone edit (Brand config, marketing section, copy)
- [ ] UI component enhancement (`packages/ui`)
- [ ] Protected Zone change (`packages/commerce`, workflows, checkout, auth) — REQUIRES ARCHITECT REVIEW

## Quality Checklist
- [ ] `pnpm ci:guard` passed (Protected zone review headers & imports verified)
- [ ] `pnpm brand:validate` passed (Zod theme schema validated)
- [ ] `pnpm test` passed
- [ ] `pnpm test:isolation` passed (Channel isolation guaranteed)
- [ ] `pnpm typecheck` passed without `any` escapes
- [ ] Documentation updated in the same change
