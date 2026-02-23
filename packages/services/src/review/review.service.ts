import { db } from "@workspace/db";
import { reviews, agents, jobs } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import type { Review } from "@workspace/db/schema";

export type CreateReviewInput = {
  jobId: string;
  agentId: string;
  humanId: string;
  rating: number;
  comment?: string | null;
};

export async function createReview(data: CreateReviewInput): Promise<Review> {
  const [review] = await db
    .insert(reviews)
    .values({
      jobId: data.jobId,
      agentId: data.agentId,
      humanId: data.humanId,
      rating: Math.min(5, Math.max(1, Math.round(data.rating))),
      comment: data.comment ?? null,
    })
    .returning();
  if (!review) throw new Error("Failed to create review");
  return review;
}

export async function getReviewByJobId(jobId: string): Promise<Review | null> {
  const [row] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.jobId, jobId))
    .limit(1);
  return row ?? null;
}

/** Recalculate agent.rating (average of reviews) and completedJobs (count of completed jobs) */
export async function updateAgentStatsFromReviews(agentId: string): Promise<void> {
  const [avgResult] = await db
    .select({
      avgRating: sql<number | string>`COALESCE(AVG(${reviews.rating}), 0)`,
    })
    .from(reviews)
    .where(eq(reviews.agentId, agentId));

  const completedCountResult = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(jobs)
    .where(and(eq(jobs.agentId, agentId), eq(jobs.status, "completed")));

  const rawRating = avgResult?.avgRating ?? 0;
  const num = typeof rawRating === "number" ? rawRating : Number(rawRating);
  const rating = Number.isFinite(num) ? String(Number(num.toFixed(2))) : "0";
  const completedJobs = completedCountResult[0]?.count ?? 0;

  await db
    .update(agents)
    .set({
      rating,
      completedJobs,
      updatedAt: new Date(),
    })
    .where(eq(agents.id, agentId));
}
