"use server";

import { authAction } from "@/lib/safe-action";
import {
  createReview,
  getReviewByJobId,
  updateAgentStatsFromReviews,
} from "@workspace/services";
import { getJobById } from "@workspace/services";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createReviewSchema = z.object({
  jobId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).nullable().optional(),
});

export const createReviewAction = authAction
  .schema(createReviewSchema)
  .action(async ({ parsedInput, ctx }) => {
    const job = await getJobById(parsedInput.jobId);
    if (!job) {
      return { success: false, error: "Job not found" };
    }
    if (job.humanId !== ctx.user.id) {
      return { success: false, error: "Forbidden" };
    }
    if (job.status !== "completed") {
      return { success: false, error: "Job must be completed to review" };
    }
    if (!job.agentId) {
      return { success: false, error: "Job has no assigned agent" };
    }
    const existing = await getReviewByJobId(parsedInput.jobId);
    if (existing) {
      return { success: false, error: "You already reviewed this job" };
    }
    await createReview({
      jobId: parsedInput.jobId,
      agentId: job.agentId,
      humanId: ctx.user.id,
      rating: parsedInput.rating,
      comment: parsedInput.comment ?? null,
    });
    await updateAgentStatsFromReviews(job.agentId);
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${parsedInput.jobId}`);
    revalidatePath("/agents");
    return { success: true };
  });
