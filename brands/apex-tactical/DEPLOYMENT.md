# Vercel Deployment Instructions for Brand: apex-tactical

1. In Vercel, create a new project linked to repository `apps/storefront-specialized`.
2. Configure Root Directory as `apps/storefront-specialized`.
3. Set Environment Variables from `brands/apex-tactical/brand.env.example`:
   - `NEXT_PUBLIC_BRAND_SLUG=apex-tactical`
   - `NEXT_PUBLIC_MEDUSA_BACKEND_URL`
   - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
4. Copy assets from `brands/apex-tactical/assets` to `public/brands/apex-tactical` in your build pipeline if custom logos/favicons are present.
5. Deploy!
