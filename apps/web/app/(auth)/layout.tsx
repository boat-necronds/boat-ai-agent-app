import { createClient } from "@workspace/supabase/server";
import { redirect } from "next/navigation";

/**
 * Auth Layout with Server-Side Guard
 *
 * Redirects authenticated users away from auth pages
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to dashboard if already authenticated
  if (user) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
