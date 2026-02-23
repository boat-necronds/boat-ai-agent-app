-- Job logs (audit trail ตาม PRD: ระบบ log ทุก action)
CREATE TABLE IF NOT EXISTS "job_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "job_id" uuid NOT NULL REFERENCES "jobs"("id") ON DELETE CASCADE,
  "event" text NOT NULL,
  "payload" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
