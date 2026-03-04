"use server";

import { authAction } from "@/lib/safe-action";
import {
  createJob,
  createJobLog,
  getAgentById,
  getJobById,
  updateJob,
} from "@workspace/services";
import { revalidatePath } from "next/cache";
import { z } from "zod";

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const createJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  goal: z.string().min(1, "Goal is required"),
  task: z.string().min(1, "Task is required"),
  allowedTools: z.array(z.string()).nullable().optional(),
  budget: z.string().min(1, "Budget is required"),
  deadline: z.string().nullable().optional(),
  maxRevisions: z.number().int().min(0).max(10).optional(),
});

export const createJobAction = authAction
  .schema(createJobSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const job = await createJob({
        humanId: ctx.user.id,
        title: parsedInput.title,
        goal: parsedInput.goal,
        task: parsedInput.task,
        allowedTools: parsedInput.allowedTools ?? null,
        budget: parsedInput.budget,
        deadline: parsedInput.deadline
          ? new Date(parsedInput.deadline as string)
          : null,
        maxRevisions: parsedInput.maxRevisions,
      });
      await createJobLog({ jobId: job.id, event: "created" });
      revalidatePath("/jobs");
      return { success: true, job: { id: String(job.id) } };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      console.error("[createJobAction] Error:", message, stack ?? "");
      throw err;
    }
  });

const updateJobSchema = z.object({
  id: z.string().uuid(),
  status: z
    .enum([
      "draft",
      "published",
      "matching",
      "pending_confirmation",
      "active",
      "in_review",
      "revision_requested",
      "completed",
      "cancelled",
      "rejected",
    ])
    .optional(),
  agentId: z.string().uuid().nullable().optional(),
  output: z.string().nullable().optional(),
  revisionFeedback: z.string().nullable().optional(),
  title: z.string().min(1).optional(),
  goal: z.string().optional(),
  task: z.string().optional(),
  budget: z.string().optional(),
});

export const updateJobAction = authAction
  .schema(updateJobSchema)
  .action(async ({ parsedInput, ctx }) => {
    const existing = await getJobById(parsedInput.id);
    if (!existing) {
      return { success: false, error: "Job not found" };
    }
    if (existing.humanId !== ctx.user.id) {
      return { success: false, error: "Forbidden" };
    }
    const updates: Parameters<typeof updateJob>[1] = {};
    if (parsedInput.status !== undefined) updates.status = parsedInput.status;
    if (parsedInput.agentId !== undefined) updates.agentId = parsedInput.agentId;
    if (parsedInput.output !== undefined) updates.output = parsedInput.output;
    if (parsedInput.revisionFeedback !== undefined)
      updates.revisionFeedback = parsedInput.revisionFeedback;
    if (parsedInput.title !== undefined) updates.title = parsedInput.title;
    if (parsedInput.goal !== undefined) updates.goal = parsedInput.goal;
    if (parsedInput.task !== undefined) updates.task = parsedInput.task;
    if (parsedInput.budget !== undefined) updates.budget = parsedInput.budget;
    if (parsedInput.status === "published") {
      updates.publishedAt = new Date();
    }
    if (parsedInput.status === "completed") {
      updates.completedAt = new Date();
    }
    if (parsedInput.status === "revision_requested") {
      updates.revisionCount = (existing.revisionCount ?? 0) + 1;
    }
    const job = await updateJob(parsedInput.id, updates);

    // Audit log
    if (parsedInput.status === "published") {
      await createJobLog({ jobId: parsedInput.id, event: "published" });
    }
    if (parsedInput.agentId !== undefined && parsedInput.status === "pending_confirmation") {
      await createJobLog({
        jobId: parsedInput.id,
        event: "agent_assigned",
        payload: { agentId: parsedInput.agentId },
      });
    }
    if (parsedInput.status === "active") {
      await createJobLog({ jobId: parsedInput.id, event: "confirmed" });
    }
    if (parsedInput.status === "cancelled") {
      await createJobLog({ jobId: parsedInput.id, event: "cancelled" });
    }
    if (parsedInput.status === "in_review") {
      await createJobLog({ jobId: parsedInput.id, event: "work_submitted" });
    }
    if (parsedInput.status === "completed") {
      await createJobLog({ jobId: parsedInput.id, event: "approved" });
    }
    if (parsedInput.status === "rejected") {
      await createJobLog({ jobId: parsedInput.id, event: "rejected" });
    }
    if (parsedInput.status === "revision_requested") {
      await createJobLog({
        jobId: parsedInput.id,
        event: "revision_requested",
        payload: parsedInput.revisionFeedback
          ? { revisionFeedback: parsedInput.revisionFeedback }
          : undefined,
      });
    }

    revalidatePath("/jobs");
    revalidatePath(`/jobs/${parsedInput.id}`);
    return { success: true, job };
  });

const runJobSchema = z.object({ id: z.string().uuid() });

export const runJobAction = authAction
  .schema(runJobSchema)
  .action(async ({ parsedInput, ctx }) => {
    const job = await getJobById(parsedInput.id);
    if (!job) {
      return { success: false, error: "Job not found" };
    }
    if (job.humanId !== ctx.user.id) {
      return { success: false, error: "Forbidden" };
    }
    if (job.status !== "active") {
      return { success: false, error: "Job must be active to run" };
    }
    if (!job.agentId) {
      return { success: false, error: "Job has no assigned agent" };
    }

    const agent = await getAgentById(job.agentId);
    if (!agent) {
      return { success: false, error: "Agent not found" };
    }

    let output: string;
    let outputFiles: string[] | null = null;

    const endpoint = (agent as { mcpEndpoint?: string | null }).mcpEndpoint?.trim();
    if (endpoint && isValidUrl(endpoint)) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId: job.id,
            title: job.title,
            goal: job.goal,
            task: job.task,
            allowedTools: job.allowedTools
              ? (JSON.parse(job.allowedTools) as string[])
              : null,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            output?: string;
            output_files?: string[];
          };
          output = data.output ?? "";
          outputFiles = data.output_files ?? null;
        } else {
          output = `[Agent endpoint returned ${res.status}] ${await res.text().catch(() => "")}`;
        }
      } catch (err) {
        output = `[Agent call failed] ${err instanceof Error ? err.message : String(err)}`;
      }
    } else {
      output =
        "Output from manual run (no MCP Endpoint set or Agent not available)";
    }

    await updateJob(parsedInput.id, {
      output: output || null,
      outputFiles,
      status: "in_review",
    });
    await createJobLog({ jobId: parsedInput.id, event: "work_submitted" });

    revalidatePath("/jobs");
    revalidatePath(`/jobs/${parsedInput.id}`);
    return { success: true };
  });
