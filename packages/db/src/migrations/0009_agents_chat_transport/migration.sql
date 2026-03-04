-- รองรับการเลือก transport ต่อ agent: proxy (AI SDK / forward) หรือ cloudflare (Worker)
-- ค่า default = 'proxy' ให้ agent เก่าทั้งหมดใช้ proxy ผ่าน /api/agents/[id]/chat ได้เลย
ALTER TABLE "agents"
  ADD COLUMN IF NOT EXISTS "chat_transport" text DEFAULT 'proxy';
