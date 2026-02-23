import { createClient } from "@workspace/supabase/server";

import {
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { getAccount } from "@workspace/services";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout";
import "@workspace/ui/styles/globals.css";
import { Separator } from "@workspace/ui/components/separator";
/**
 * Dashboard Layout with Server-Side Authentication Guard
 *
 * This is the Next.js 16 way of protecting routes.
 * Authentication happens in Server Components, not in proxy.ts
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("🏠 Dashboard layout rendering...");

  const supabase = await createClient();

  // Server-side authentication check
  console.log("🔍 Checking authentication...");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log("👤 Auth check result:", {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    error: error?.message,
  });

  // Redirect to login if not authenticated
  if (error || !user) {
    console.log("❌ Not authenticated, redirecting to login...");
    redirect("/login");
  }

  // Fetch user account
  console.log("📊 Fetching user account...");
  const account = await getAccount(user.id);
  console.log("✅ Account fetched:", {
    hasAccount: !!account,
    fullName: account?.fullName,
  });

  const userData = {
    email: user.email || "",
    fullName: account?.fullName || null,
    avatarUrl: account?.avatarUrl ?? null,
  };

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />
      <main className="flex flex-1 flex-col gap-2">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
