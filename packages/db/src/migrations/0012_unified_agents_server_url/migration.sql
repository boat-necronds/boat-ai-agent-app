-- ใช้ agents-server เดียว (Bun) ที่ port 3010 สำหรับ finance, fitness, study, travel, weather
-- Chat endpoint: POST /api/chat/agent/:agent (Next API route จะส่งไป path นี้แล้ว)
UPDATE "agents"
SET "url" = 'http://localhost:3010'
WHERE "slug" IN ('finance', 'fitness', 'study', 'travel', 'weather');
