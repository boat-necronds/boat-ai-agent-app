import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Update Supabase session in Next.js 16 proxy.ts
 *
 * IMPORTANT: This only updates session cookies.
 * Do NOT add authentication logic here!
 *
 * @example
 * ```ts
 * // app/proxy.ts
 * import { updateSession } from '@workspace/supabase/middleware'
 *
 * export async function proxy(request: NextRequest) {
 *   return await updateSession(request)
 * }
 * ```
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );

  // Only refresh the session, no auth checks
  await supabase.auth.getUser();

  return response;
}

/**
 * @deprecated Use Server Layout Guards instead of checking auth in proxy.ts
 *
 * In Next.js 16, authentication should be handled in layout.tsx:
 *
 * @example
 * ```tsx
 * // app/(dashboard)/layout.tsx
 * import { createClient } from '@workspace/supabase/server'
 * import { redirect } from 'next/navigation'
 *
 * export default async function DashboardLayout({ children }) {
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *
 *   if (!user) {
 *     redirect('/login')
 *   }
 *
 *   return <>{children}</>
 * }
 * ```
 */
export function createClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    },
  );
}
