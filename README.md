# shadcn/ui monorepo template

This template is for creating a monorepo with shadcn/ui.

## Usage

```bash
pnpm dlx shadcn@latest init
```

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button"
```



# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hlgezrpdvcnhqanovinw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZ2V6cnBkdmNuaHFhbm92aW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MjE4MTQsImV4cCI6MjA4NjE5NzgxNH0.CtkCeNzqvtl_SVE6SEg7rk3rS7tbq_M_ZFUdvv4Osm0
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_79DE3TiIFg_pp8C-OFJGXw_jfceoXky

# Database (for Drizzle) - Replace [YOUR-PASSWORD] with your actual database password
DATABASE_URL="postgresql://postgres.hlgezrpdvcnhqanovinw:goWkQpONL2L1qKJN@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
