-- Add status, sort_order, slug to agents table
ALTER TABLE "agents"
  ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active' NOT NULL,
  ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS "slug" text;

-- Unique slug for URL-friendly identifier
CREATE UNIQUE INDEX IF NOT EXISTS "agents_slug_unique" ON "agents" ("slug") WHERE "slug" IS NOT NULL;

-- Backfill slug from agent_type for existing rows
UPDATE "agents" SET "slug" = "agent_type" WHERE "slug" IS NULL;
UPDATE "agents" SET "sort_order" = 0 WHERE "sort_order" IS NULL;
