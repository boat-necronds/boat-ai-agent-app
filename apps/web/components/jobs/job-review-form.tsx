"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { createReviewAction } from "@/actions/reviews";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

export function JobReviewForm({
  jobId,
  existingReview,
}: {
  jobId: string;
  existingReview: { rating: number; comment: string | null } | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const { execute, isExecuting } = useAction(createReviewAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Rating saved");
        router.refresh();
      } else if (data && "error" in data) {
        toast.error((data as { error: string }).error);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Something went wrong");
    },
  });

  if (existingReview) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm font-medium text-muted-foreground">Your rating</p>
        <div className="mt-1 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${i <= existingReview.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
            />
          ))}
          <span className="ml-2 text-sm">{existingReview.rating}/5</span>
        </div>
        {existingReview.comment && (
          <p className="mt-2 text-sm whitespace-pre-wrap">{existingReview.comment}</p>
        )}
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error("Please choose a rating from 1–5");
      return;
    }
    execute({
      jobId,
      rating,
      comment: comment.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Rating (1–5)</Label>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              className={`rounded border p-2 transition-colors ${
                i <= rating
                  ? "border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                  : "border-border hover:bg-muted"
              }`}
            >
              <Star className={`h-5 w-5 ${i <= rating ? "fill-current" : ""}`} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="review-comment">Comment (optional)</Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a short review..."
          rows={2}
          className="mt-1 resize-none"
          maxLength={2000}
        />
      </div>
      <Button type="submit" disabled={isExecuting}>
        Submit rating
      </Button>
    </form>
  );
}
