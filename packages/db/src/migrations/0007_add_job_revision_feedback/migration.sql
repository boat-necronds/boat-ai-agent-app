-- Add revision_feedback to jobs (Request revision flow)
ALTER TABLE "jobs"
  ADD COLUMN IF NOT EXISTS "revision_feedback" text;
