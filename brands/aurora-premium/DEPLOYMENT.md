# Vercel Deployment Instructions for Brand: aurora-premium

1. In Vercel, create a new project linked to repository `apps/storefront-b2c`.
2. Configure Root Directory as `apps/storefront-b2c`.
3. Set Environment Variables from `brands/aurora-premium/brand.env.example`:
   - `NEXT_PUBLIC_BRAND_SLUG=aurora-premium`
   - `NEXT_PUBLIC_MEDUSA_BACKEND_URL`
   - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
4. Copy assets from `brands/aurora-premium/assets` to `public/brands/aurora-premium` in your build pipeline if custom logos/favicons are present.
5. Deploy!
