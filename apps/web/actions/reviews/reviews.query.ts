"use server";

import { authAction } from "@/lib/safe-action";
import { getJobById, getReviewByJobId } from "@workspace/services";
import { z } from "zod";

const getReviewByJobSchema = z.object({ jobId: z.string().uuid() });

export const getReviewByJobAction = authAction
  .schema(getReviewByJobSchema)
  .action(async ({ parsedInput, ctx }) => {
    const job = await getJobById(parsedInput.jobId);
    if (!job) {
      return { success: false, error: "Job not found" };
    }
    if (job.humanId !== ctx.user.id) {
      return { success: false, error: "Forbidden" };
    }
    const review = await getReviewByJobId(parsedInput.jobId);
    if (!review) {
      return { success: true, review: null };
    }
    return {
      success: true,
      review: {
        id: String(review.id),
        jobId: String(review.jobId),
        agentId: String(review.agentId),
        rating: review.rating,
        comment: review.comment ?? null,
        createdAt: review.createdAt,
      },
    };
  });
