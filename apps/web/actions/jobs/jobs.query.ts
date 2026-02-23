"use server";

import { action } from "@/lib/safe-action";
import { authAction } from "@/lib/safe-action";
import {
  getJobsByHumanId,
  getJobById,
  getJobLogsByJobId,
  type JobStatus,
} from "@workspace/services";
import { z } from "zod";

export type JobItem = {
  id: string;
  humanId: string;
  agentId: string | null;
  title: string;
  goal: string;
  task: string;
  allowedTools: string[] | null;
  budget: string;
  deadline: Date | null;
  status: string;
  output: string | null;
  outputFiles: string[] | null;
  revisionCount: number;
  maxRevisions: number;
  revisionFeedback: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  confirmedAt: Date | null;
  completedAt: Date | null;
};

const statusSchema = z
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
  .optional();

export const getJobsAction = authAction
  .schema(z.object({ status: statusSchema }))
  .action(async ({ parsedInput, ctx }) => {
    const jobs = await getJobsByHumanId(ctx.user.id, {
      status: parsedInput.status as JobStatus | undefined,
    });
    const list: JobItem[] = jobs.map((row) => {
      let allowedTools: string[] | null = null;
      let outputFiles: string[] | null = null;
      if (row.allowedTools) {
        try {
          allowedTools = JSON.parse(row.allowedTools) as string[];
        } catch {
          allowedTools = null;
        }
      }
      if (row.outputFiles) {
        try {
          outputFiles = JSON.parse(row.outputFiles) as string[];
        } catch {
          outputFiles = null;
        }
      }
      return {
        id: String(row.id),
        humanId: String(row.humanId),
        agentId: row.agentId ? String(row.agentId) : null,
        title: row.title ?? "",
        goal: row.goal ?? "",
        task: row.task ?? "",
        allowedTools,
        budget: row.budget ?? "0",
        deadline: row.deadline ?? null,
        status: row.status ?? "draft",
        output: row.output ?? null,
        outputFiles,
        revisionCount: row.revisionCount ?? 0,
        maxRevisions: row.maxRevisions ?? 2,
        revisionFeedback: row.revisionFeedback ?? null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        publishedAt: row.publishedAt ?? null,
        confirmedAt: row.confirmedAt ?? null,
        completedAt: row.completedAt ?? null,
      };
    });
    return { success: true, jobs: list };
  });

const getJobByIdSchema = z.object({ id: z.string().uuid() });

export type JobLogItem = {
  id: string;
  jobId: string;
  event: string;
  payload: Record<string, unknown> | null;
  createdAt: Date;
};

export const getJobLogsAction = authAction
  .schema(getJobByIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    const job = await getJobById(parsedInput.id);
    if (!job) {
      return { success: false, error: "Job not found" };
    }
    if (job.humanId !== ctx.user.id) {
      return { success: false, error: "Forbidden" };
    }
    const logs = await getJobLogsByJobId(parsedInput.id);
    const list: JobLogItem[] = logs.map((row) => ({
      id: String(row.id),
      jobId: String(row.jobId),
      event: row.event ?? "",
      payload: row.payload
        ? (() => {
            try {
              return JSON.parse(row.payload!) as Record<string, unknown>;
            } catch {
              return null;
            }
          })()
        : null,
      createdAt: row.createdAt,
    }));
    return { success: true, logs: list };
  });

export const getJobByIdAction = authAction
  .schema(getJobByIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    const job = await getJobById(parsedInput.id);
    if (!job) {
      return { success: false, error: "Job not found" };
    }
    if (job.humanId !== ctx.user.id) {
      return { success: false, error: "Forbidden" };
    }
    let allowedTools: string[] | null = null;
    let outputFiles: string[] | null = null;
    if (job.allowedTools) {
      try {
        allowedTools = JSON.parse(job.allowedTools) as string[];
      } catch {
        allowedTools = null;
      }
    }
    if (job.outputFiles) {
      try {
        outputFiles = JSON.parse(job.outputFiles) as string[];
      } catch {
        outputFiles = null;
      }
    }
    return {
      success: true,
      job: {
        id: String(job.id),
        humanId: String(job.humanId),
        agentId: job.agentId ? String(job.agentId) : null,
        title: job.title ?? "",
        goal: job.goal ?? "",
        task: job.task ?? "",
        allowedTools,
        budget: job.budget ?? "0",
        deadline: job.deadline ?? null,
        status: job.status ?? "draft",
        output: job.output ?? null,
        outputFiles,
        revisionCount: job.revisionCount ?? 0,
        maxRevisions: job.maxRevisions ?? 2,
        revisionFeedback: job.revisionFeedback ?? null,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        publishedAt: job.publishedAt ?? null,
        confirmedAt: job.confirmedAt ?? null,
        completedAt: job.completedAt ?? null,
      },
    };
  });
