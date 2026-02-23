"use client";

import type { UIMessage } from "ai";
import { useAgentChat } from "@cloudflare/ai-chat/react";
import { useAgent } from "agents/react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { useAction } from "next-safe-action/hooks";
import { updateJobAction } from "@/actions/jobs";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { AgentItem } from "@/actions/agents";

const DEFAULT_MODEL_OPTIONS = [
  "@cf/openai/gpt-oss-20b",
  "@cf/openai/gpt-oss-120b",
  "@cf/meta/llama-4-scout-17b-16e-instruct",
  "@cf/zai-org/glm-4.7-flash",
];

function getTextFromMessage(msg: UIMessage): string {
  const textParts =
    msg.parts?.filter(
      (p): p is { type: "text"; text: string } => p.type === "text"
    ) ?? [];
  return textParts.map((p) => p.text).join("");
}

export function JobRunChatDialog({
  open,
  onOpenChange,
  job,
  agent,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: { id: string; goal: string; task: string; revisionFeedback?: string | null };
  agent: AgentItem;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const hasAutoSaved = useRef(false);

  const modelOptions = useMemo(() => {
    const list = agent.allowedModels ?? [];
    return list.length > 0 ? list : DEFAULT_MODEL_OPTIONS;
  }, [agent.allowedModels]);

  const effectiveModelId =
    agent.defaultModel ?? modelOptions[0] ?? null;

  const chatAgent = useAgent({
    agent: "ChatAgent",
    host: agent.host ?? "",
  });

  const { messages, sendMessage, status } = useAgentChat({
    agent: chatAgent,
    body: () => (effectiveModelId ? { model: effectiveModelId } : {}),
    getInitialMessages: null,
  });

  const { execute: executeUpdate, isExecuting: isSaving } = useAction(
    updateJobAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success("Output saved to job");
          onOpenChange(false);
          router.refresh();
          onSuccess?.();
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Something went wrong");
      },
    }
  );

  const lastAssistantText = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") {
        return getTextFromMessage(messages[i]);
      }
    }
    return "";
  }, [messages]);

  const isReady = status === "ready";
  const hasAssistantReply = lastAssistantText.length > 0;
  const canSave = isReady && hasAssistantReply && !hasAutoSaved.current;

  const handleSendJob = useCallback(() => {
    if (!agent.host) {
      toast.error("This agent has no URL (host) for chat");
      return;
    }
    let text = `Please complete this job.\n\n**Goal:** ${job.goal}\n\n**Task:** ${job.task}`;
    if (job.revisionFeedback?.trim()) {
      text += `\n\n**Feedback from user (please address this in your response):**\n${job.revisionFeedback.trim()}`;
    }
    sendMessage({ role: "user", parts: [{ type: "text", text }] });
    setSent(true);
  }, [agent.host, job.goal, job.task, job.revisionFeedback, sendMessage]);

  const handleUseAsOutput = useCallback(() => {
    if (!lastAssistantText.trim()) return;
    hasAutoSaved.current = true;
    executeUpdate({
      id: job.id,
      output: lastAssistantText.trim(),
      status: "in_review",
    });
  }, [job.id, lastAssistantText, executeUpdate]);

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] flex flex-col min-w-2xl">
        <DialogHeader>
          <DialogTitle>Run job with Agent (chat)</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Send job details to {agent.name}; the reply will be saved as the job output.
          </p>
        </DialogHeader>
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {!sent ? (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="font-medium text-muted-foreground">Goal</p>
                <p className="mt-1 whitespace-pre-wrap">{job.goal}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="font-medium text-muted-foreground">Task</p>
                <p className="mt-1 whitespace-pre-wrap">{job.task}</p>
              </div>
              <Button
                onClick={handleSendJob}
                disabled={!agent.host || isLoading}
              >
                Send to Agent
              </Button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
              {messages.map((msg, idx) => (
                <div
                  key={`${msg.role}-${idx}`}
                  className={
                    msg.role === "user"
                      ? "rounded-lg border bg-muted/50 p-3 text-sm ml-4"
                      : "rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm mr-4"
                  }
                >
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {msg.role === "user" ? "You" : agent.name}
                  </p>
                  <p className="whitespace-pre-wrap">
                    {getTextFromMessage(msg)}
                  </p>
                </div>
              ))}
              {isLoading && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm mr-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {agent.name}
                  </p>
                  <p className="text-muted-foreground animate-pulse">
                    Typing...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          {canSave && (
            <Button
              onClick={handleUseAsOutput}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Use this as job output"}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
