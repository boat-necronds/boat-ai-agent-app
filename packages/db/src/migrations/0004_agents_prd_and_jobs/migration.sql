-- PRD: extend agents for marketplace (type, skills, pricing, rating, etc.)
ALTER TABLE "agents"
  ADD COLUMN IF NOT EXISTS "type" text DEFAULT 'platform' NOT NULL,
  ADD COLUMN IF NOT EXISTS "skills" text,
  ADD COLUMN IF NOT EXISTS "capabilities" text,
  ADD COLUMN IF NOT EXISTS "pricing_model" text,
  ADD COLUMN IF NOT EXISTS "price" text,
  ADD COLUMN IF NOT EXISTS "rating" text DEFAULT '0',
  ADD COLUMN IF NOT EXISTS "total_jobs" integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS "completed_jobs" integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS "mcp_endpoint" text,
  ADD COLUMN IF NOT EXISTS "approved_at" timestamp;

-- PRD: jobs table (Human จ้าง AI)
CREATE TABLE IF NOT EXISTS "jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "human_id" uuid NOT NULL REFERENCES "accounts"("id") ON DELETE CASCADE,
  "agent_id" uuid REFERENCES "agents"("id"),
  "title" text NOT NULL,
  "goal" text NOT NULL,
  "task" text NOT NULL,
  "allowed_tools" text,
  "budget" text NOT NULL,
  "deadline" timestamp,
  "status" text DEFAULT 'draft' NOT NULL,
  "output" text,
  "output_files" text,
  "revision_count" integer DEFAULT 0 NOT NULL,
  "max_revisions" integer DEFAULT 2 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "published_at" timestamp,
  "confirmed_at" timestamp,
  "completed_at" timestamp
);
