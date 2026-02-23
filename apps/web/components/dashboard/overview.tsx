import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export function DashboardOverview() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>Your account activity overview</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          Chart placeholder - Add your chart component here
        </div>
      </CardContent>
    </Card>
  );
}
