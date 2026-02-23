# Next.js 16 Migration Guide

This project has been updated to follow Next.js 16 best practices.

## Major Changes

### 1. middleware.ts → proxy.ts

**Old (Next.js 15):**

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Auth checks here ❌
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

**New (Next.js 16):**

```typescript
// app/proxy.ts
export async function proxy(request: NextRequest) {
  // Only session cookie updates ✅
  return await updateSession(request);
}
```

### 2. Authentication in Layout Guards

**Protected Routes:**

```tsx
// app/(dashboard)/layout.tsx
import { createClient } from "@workspace/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return <>{children}</>;
}
```

**Auth Pages:**

```tsx
// app/(auth)/layout.tsx
import { createClient } from "@workspace/supabase/server";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
```

## Why This Change?

### Security: CVE-2025-29927

Next.js middleware had a critical vulnerability where authentication could be bypassed under high load due to Edge Runtime limitations.

### Performance

- **Before:** Auth checks in middleware add latency to EVERY request
- **After:** Auth checks only on protected routes (faster TTFB)

### Clarity

- **Before:** Global middleware file with mixed concerns
- **After:** Explicit auth guards per route group

## Migration Checklist

- [x] Renamed `middleware.ts` to `app/proxy.ts`
- [x] Renamed function `middleware` to `proxy`
- [x] Moved authentication to layout.tsx files
- [x] Created `(dashboard)/layout.tsx` with auth guard
- [x] Created `(auth)/layout.tsx` with redirect guard
- [x] Updated `@workspace/supabase` package
- [x] Removed auth logic from proxy.ts

## What proxy.ts Should Do

✅ **Allowed:**

- Update session cookies
- Geo-routing
- Rewrites/redirects (routing only)
- Headers manipulation

❌ **Not Allowed:**

- Authentication checks
- Database queries
- Complex business logic
- JWT verification

## Benefits

1. **More Secure:** No middleware bypass vulnerability
2. **Better Performance:** Auth only where needed
3. **Clearer Code:** Explicit boundaries
4. **Type Safety:** Full TypeScript support in layouts
5. **Better DX:** Easier to understand and maintain

## References

- [CVE-2025-29927](https://github.com/vercel/next.js/security/advisories/GHSA-f82v-jwr5-mffw)
- [Next.js 16 Proxy Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- Content rephrased for compliance with licensing restrictions

## Need Help?

Check `packages/supabase/README.md` for detailed usage examples.
