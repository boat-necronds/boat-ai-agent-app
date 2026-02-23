import { db } from "@workspace/db";
import { jobs, type Job } from "@workspace/db/schema";
import { eq, desc, and } from "drizzle-orm";

export type JobStatus =
  | "draft"
  | "published"
  | "matching"
  | "pending_confirmation"
  | "active"
  | "in_review"
  | "revision_requested"
  | "completed"
  | "cancelled"
  | "rejected";

export type CreateJobInput = {
  humanId: string;
  title: string;
  goal: string;
  task: string;
  allowedTools?: string[] | null;
  budget: string;
  deadline?: Date | null;
  maxRevisions?: number;
};

export async function createJob(data: CreateJobInput): Promise<Job> {
  const [job] = await db
    .insert(jobs)
    .values({
      humanId: data.humanId,
      title: data.title,
      goal: data.goal,
      task: data.task,
      allowedTools: data.allowedTools
        ? JSON.stringify(data.allowedTools)
        : null,
      budget: data.budget,
      deadline: data.deadline ?? null,
      maxRevisions: data.maxRevisions ?? 2,
      status: "draft",
    })
    .returning();
  if (!job) throw new Error("Failed to create job");
  return job;
}

export async function getJobsByHumanId(
  humanId: string,
  options?: { status?: JobStatus }
): Promise<Job[]> {
  const conditions = [eq(jobs.humanId, humanId)];
  if (options?.status) {
    conditions.push(eq(jobs.status, options.status));
  }
  return db
    .select()
    .from(jobs)
    .where(and(...conditions))
    .orderBy(desc(jobs.updatedAt), desc(jobs.createdAt));
}

export async function getJobById(id: string): Promise<Job | null> {
  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, id))
    .limit(1);
  return job ?? null;
}

export type UpdateJobInput = Partial<{
  agentId: string | null;
  title: string;
  goal: string;
  task: string;
  allowedTools: string[] | null;
  budget: string;
  deadline: Date | null;
  status: JobStatus;
  output: string | null;
  outputFiles: string[] | null;
  revisionCount: number;
  revisionFeedback: string | null;
  publishedAt: Date | null;
  confirmedAt: Date | null;
  completedAt: Date | null;
}>;

export async function updateJob(id: string, data: UpdateJobInput): Promise<Job> {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.agentId !== undefined) updateData.agentId = data.agentId;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.goal !== undefined) updateData.goal = data.goal;
  if (data.task !== undefined) updateData.task = data.task;
  if (data.allowedTools !== undefined)
    updateData.allowedTools = data.allowedTools
      ? JSON.stringify(data.allowedTools)
      : null;
  if (data.budget !== undefined) updateData.budget = data.budget;
  if (data.deadline !== undefined) updateData.deadline = data.deadline;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.output !== undefined) updateData.output = data.output;
  if (data.outputFiles !== undefined)
    updateData.outputFiles = data.outputFiles
      ? JSON.stringify(data.outputFiles)
      : null;
  if (data.revisionCount !== undefined)
    updateData.revisionCount = data.revisionCount;
  if (data.revisionFeedback !== undefined)
    updateData.revisionFeedback = data.revisionFeedback;
  if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt;
  if (data.confirmedAt !== undefined) updateData.confirmedAt = data.confirmedAt;
  if (data.completedAt !== undefined) updateData.completedAt = data.completedAt;

  const [updated] = await db
    .update(jobs)
    .set(updateData as Partial<Job>)
    .where(eq(jobs.id, id))
    .returning();

  if (!updated) throw new Error("Job not found");
  return updated;
}
