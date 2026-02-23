import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Users,
  Activity,
  DollarSign,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: "up" | "down";
}

function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      description: "+12% from last month",
      icon: Users,
      trend: "up" as const,
    },
    {
      title: "Active Sessions",
      value: "42",
      description: "+8% from last week",
      icon: Activity,
      trend: "up" as const,
    },
    {
      title: "Revenue",
      value: "$12,345",
      description: "+23% from last month",
      icon: DollarSign,
      trend: "up" as const,
    },
    {
      title: "Growth",
      value: "+18.2%",
      description: "Compared to last quarter",
      icon: TrendingUp,
      trend: "up" as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
