interface DashboardHeaderProps {
  userName?: string | null;
  userEmail?: string;
}

export function DashboardHeader({ userName, userEmail }: DashboardHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Welcome back, {userName || userEmail}! 👋
      </p>
    </div>
  );
}
