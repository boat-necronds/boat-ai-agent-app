import { getJobsAction } from "@/actions/jobs";
import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { Briefcase, Eye, Plus } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  matching: "Matching",
  pending_confirmation: "Pending confirmation",
  active: "Active",
  in_review: "In review",
  revision_requested: "Revision requested",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

export default async function JobsPage() {
  const result = await getJobsAction({});
  const jobs = result?.data?.success ? result.data.jobs : [];
  const error =
    result?.data?.success === false && "error" in result.data
      ? (result.data as { error?: string }).error
      : null;

  if (error) {
    return (
      <EmptyState variant="error" title="Something went wrong" message={error} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Jobs you created — status from draft → published → … → completed
          </p>
        </div>
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            New job
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Job list</CardTitle>
              <CardDescription>
                Manage jobs sent to AI Agent — view status and results
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <EmptyState
              message="No jobs yet"
              description="Click New job to create your first job"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Updated
                  </TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {job.goal}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          job.status === "completed"
                            ? "default"
                            : job.status === "active" ||
                                job.status === "in_review"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {STATUS_LABEL[job.status] ?? job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{job.budget}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {new Date(job.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/jobs/${job.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
