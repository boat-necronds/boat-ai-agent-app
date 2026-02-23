"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { updateJobAction } from "@/actions/jobs";
import { JobRunChatDialog } from "@/components/jobs/job-run-chat-dialog";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { JobItem } from "@/actions/jobs";
import type { AgentItem } from "@/actions/agents";

export function JobDetailActions({
  job,
  agents = [],
}: {
  job: JobItem;
  agents?: AgentItem[];
}) {
  const router = useRouter();
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState("");
  const { execute, isExecuting } = useAction(updateJobAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Updated");
        router.refresh();
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Something went wrong");
    },
  });
  const [runChatOpen, setRunChatOpen] = useState(false);

  const setStatus = (status: JobItem["status"]) => {
    execute({
      id: job.id,
      status: status as
        | "draft"
        | "published"
        | "matching"
        | "pending_confirmation"
        | "active"
        | "in_review"
        | "revision_requested"
        | "completed"
        | "cancelled"
        | "rejected",
    });
  };

  const assignAgent = () => {
    if (!selectedAgentId) {
      toast.error("Please select an Agent");
      return;
    }
    execute({
      id: job.id,
      agentId: selectedAgentId,
      status: "pending_confirmation",
    });
  };

  const activeAgents = agents.filter((a) => a.status === "active");
  const jobAgent = job.agentId
    ? agents.find((a) => a.id === job.agentId)
    : null;

  const submitRevisionRequest = () => {
    execute({
      id: job.id,
      status: "revision_requested",
      revisionFeedback: revisionFeedback.trim() || null,
    });
    setRevisionFeedback("");
    setRevisionDialogOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {job.status === "draft" && (
        <Button
          onClick={() => setStatus("published")}
          disabled={isExecuting}
        >
          Publish
        </Button>
      )}
      {job.status === "published" && (
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedAgentId}
            onValueChange={setSelectedAgentId}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select Agent" />
            </SelectTrigger>
            <SelectContent>
              {activeAgents.length === 0 ? (
<SelectItem value="_none" disabled>
                No agents available
              </SelectItem>
              ) : (
                activeAgents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                    {a.price ? ` — ${a.price}` : ""}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            onClick={assignAgent}
            disabled={isExecuting || !selectedAgentId || activeAgents.length === 0}
          >
            Assign this Agent
          </Button>
        </div>
      )}
      {job.status === "pending_confirmation" && (
        <>
          <Button
            onClick={() => setStatus("active")}
            disabled={isExecuting}
          >
            Confirm & start
          </Button>
          <Button
            variant="outline"
            onClick={() => setStatus("cancelled")}
            disabled={isExecuting}
          >
            Cancel
          </Button>
        </>
      )}
      {(job.status === "in_review" || job.status === "revision_requested") && (
        <>
          <Button
            onClick={() => setStatus("completed")}
            disabled={isExecuting}
          >
            Approve
          </Button>
          <Button
            variant="destructive"
            onClick={() => setStatus("rejected")}
            disabled={isExecuting}
          >
            Reject
          </Button>
          {job.revisionCount < job.maxRevisions && (
            <Dialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" disabled={isExecuting}>
                  Request revision
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request revision</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="revision-feedback">Feedback for Agent (optional)</Label>
                  <Textarea
                    id="revision-feedback"
                    value={revisionFeedback}
                    onChange={(e) => setRevisionFeedback(e.target.value)}
                    placeholder="Describe what you want changed..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setRevisionDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={submitRevisionRequest} disabled={isExecuting}>
                    Submit revision request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
      {job.status === "matching" && (
        <span className="text-sm text-muted-foreground">
          Matching Agent
        </span>
      )}
      {job.status === "active" && jobAgent && (
        <>
          <Button onClick={() => setRunChatOpen(true)}>
            Run
          </Button>
          <JobRunChatDialog
            open={runChatOpen}
            onOpenChange={setRunChatOpen}
            job={{
              id: job.id,
              goal: job.goal,
              task: job.task,
              revisionFeedback: job.revisionFeedback ?? undefined,
            }}
            agent={jobAgent}
            onSuccess={() => router.refresh()}
          />
        </>
      )}
    </div>
  );
}
