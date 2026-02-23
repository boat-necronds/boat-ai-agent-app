import { getJobByIdAction, getJobLogsAction } from "@/actions/jobs";
import { getReviewByJobAction } from "@/actions/reviews";
import { getAgentsAction } from "@/actions/agents";
import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ArrowLeft, Briefcase, History } from "lucide-react";
import { JobDetailActions } from "@/components/jobs/job-detail-actions";
import { JobReviewForm } from "@/components/jobs/job-review-form";

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

const LOG_EVENT_LABEL: Record<string, string> = {
  created: "Created",
  published: "Published",
  agent_assigned: "Agent assigned",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  work_submitted: "Work submitted",
  in_review: "In review",
  approved: "Approved",
  rejected: "Rejected",
  revision_requested: "Revision requested",
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [result, agentsResult, logsResult, reviewResult] = await Promise.all([
    getJobByIdAction({ id }),
    getAgentsAction(),
    getJobLogsAction({ id }),
    getReviewByJobAction({ jobId: id }),
  ]);
  const agents = agentsResult?.data?.success ? agentsResult.data.agents : [];
  const logs: { id: string; event: string; payload: Record<string, unknown> | null; createdAt: Date }[] =
    logsResult?.data?.success ? logsResult.data.logs ?? [] : [];
  const review =
    reviewResult?.data?.success && reviewResult.data.review
      ? {
          rating: reviewResult.data.review.rating,
          comment: reviewResult.data.review.comment,
        }
      : null;

  if (!result?.data?.success || !result.data.job) {
    return (
      <EmptyState
        variant="error"
        title="Job not found"
        message={result?.data && "error" in result.data ? (result.data as { error: string }).error : "This job was not found"}
      />
    );
  }

  const job = result.data.job;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/jobs">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
          <p className="text-muted-foreground mt-1">
            Status: {STATUS_LABEL[job.status] ?? job.status}
          </p>
        </div>
        <Badge
          variant={
            job.status === "completed"
              ? "default"
              : job.status === "active" || job.status === "in_review"
                ? "secondary"
                : "outline"
          }
        >
          {STATUS_LABEL[job.status] ?? job.status}
        </Badge>
      </div>

      <JobDetailActions job={job} agents={agents} />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
<CardTitle>Job details</CardTitle>
            <CardDescription>Goal, Task, Budget (PRD)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Goal</p>
            <p className="mt-1 whitespace-pre-wrap">{job.goal}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Task</p>
            <p className="mt-1 whitespace-pre-wrap">{job.task}</p>
          </div>
          {job.agentId && (
            <div className="text-sm">
              <span className="text-muted-foreground">Assigned agent:</span>{" "}
              {agents.find((a) => a.id === job.agentId)?.name ?? job.agentId}
            </div>
          )}
          <div className="flex flex-wrap gap-4 text-sm">
            <span>
              <span className="text-muted-foreground">Budget:</span> {job.budget}
            </span>
            <span>
              <span className="text-muted-foreground">Max revisions:</span> {job.maxRevisions}
            </span>
            {job.deadline && (
              <span>
                <span className="text-muted-foreground">Deadline:</span>{" "}
                {new Date(job.deadline).toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {job.status === "completed" && job.agentId && (
        <Card>
          <CardHeader>
            <CardTitle>Rate this Agent</CardTitle>
            <CardDescription>Help others by leaving a rating</CardDescription>
          </CardHeader>
          <CardContent>
            <JobReviewForm jobId={job.id} existingReview={review} />
          </CardContent>
        </Card>
      )}

      {(job.output || job.status === "in_review" || job.status === "completed") && (
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <CardDescription>Work submitted by the Agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {job.output ? (
              <div className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm">
                {job.output}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No output yet</p>
            )}
            {job.outputFiles && job.outputFiles.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Attachments</p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  {job.outputFiles.map((url, i) => (
                    <li key={i}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:no-underline"
                      >
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {logs && logs.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-muted p-2">
                <History className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle>Activity log</CardTitle>
                <CardDescription>Event timeline for this job</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="flex gap-3 border-l-2 border-muted pl-4 py-1"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {LOG_EVENT_LABEL[log.event] ?? log.event}
                    </p>
                    {log.payload && "revisionFeedback" in log.payload && (
                      <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                        {String(log.payload.revisionFeedback)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
