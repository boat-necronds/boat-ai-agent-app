import { DashboardOverview } from "./overview";
import { RecentActivity } from "./recent-activity";

export function DashboardContent() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <DashboardOverview />
      <RecentActivity />
    </div>
  );
}
