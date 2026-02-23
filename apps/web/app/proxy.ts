import { updateSession } from "@workspace/supabase/middleware";
import { type NextRequest } from "next/server";

/**
 * Next.js 16 Proxy Layer
 *
 * WARNING: Do NOT put authentication logic here!
 * Auth should be handled in layout.tsx using Server Components
 *
 * This proxy is only for:
 * - Session cookie updates
 * - Routing (rewrites/redirects)
 * - Headers manipulation
 */
export async function proxy(request: NextRequest) {
  // Only update Supabase session cookies
  // No authentication checks here!
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
