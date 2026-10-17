# Vercel Deployment Instructions for Brand: vanguard-wholesale

1. In Vercel, create a new project linked to repository `apps/storefront-b2b`.
2. Configure Root Directory as `apps/storefront-b2b`.
3. Set Environment Variables from `brands/vanguard-wholesale/brand.env.example`:
   - `NEXT_PUBLIC_BRAND_SLUG=vanguard-wholesale`
   - `NEXT_PUBLIC_MEDUSA_BACKEND_URL`
   - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
4. Copy assets from `brands/vanguard-wholesale/assets` to `public/brands/vanguard-wholesale` in your build pipeline if custom logos/favicons are present.
5. Deploy!
