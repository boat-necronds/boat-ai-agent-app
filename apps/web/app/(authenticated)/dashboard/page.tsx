import { createClient } from "@workspace/supabase/server";
import { getAccount } from "@workspace/services";
import {
  DashboardHeader,
  DashboardStats,
  DashboardContent,
} from "@/components/dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const account = await getAccount(user!.id);

  return (
    <div className="space-y-6">
      <DashboardHeader userName={account?.fullName} userEmail={user?.email} />
      <DashboardStats />
      <DashboardContent />
    </div>
  );
}
