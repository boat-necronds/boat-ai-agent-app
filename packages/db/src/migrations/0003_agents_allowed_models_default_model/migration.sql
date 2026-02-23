-- Add allowed_models and default_model to agents table (for multi-model selection per agent)
ALTER TABLE "agents"
  ADD COLUMN IF NOT EXISTS "allowed_models" text,
  ADD COLUMN IF NOT EXISTS "default_model" text;
