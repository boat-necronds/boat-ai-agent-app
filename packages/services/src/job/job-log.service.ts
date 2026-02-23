import { db } from "@workspace/db";
import { jobLogs, type JobLog } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";

export type JobLogEvent =
  | "created"
  | "published"
  | "agent_assigned"
  | "confirmed"
  | "cancelled"
  | "work_submitted"
  | "in_review"
  | "approved"
  | "rejected"
  | "revision_requested";

export type CreateJobLogInput = {
  jobId: string;
  event: JobLogEvent;
  payload?: Record<string, unknown> | null;
};

export async function createJobLog(
  data: CreateJobLogInput
): Promise<JobLog> {
  const [log] = await db
    .insert(jobLogs)
    .values({
      jobId: data.jobId,
      event: data.event,
      payload: data.payload ? JSON.stringify(data.payload) : null,
    })
    .returning();
  if (!log) throw new Error("Failed to create job log");
  return log;
}

export async function getJobLogsByJobId(jobId: string): Promise<JobLog[]> {
  return db
    .select()
    .from(jobLogs)
    .where(eq(jobLogs.jobId, jobId))
    .orderBy(asc(jobLogs.createdAt));
}
