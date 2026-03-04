-- Seed agents ที่ชี้ไปที่ boat-agent-all (Cloudflare Worker)
-- URL หลัก: https://boat-agent-all.atsadawat-kontha.workers.dev
-- chat_transport = 'cloudflare' เพราะเป็น Cloudflare Worker (ไม่ใช่ proxy/AI SDK ธรรมดา)
-- รัน 0009_agents_chat_transport ก่อนเพื่อเพิ่มคอลัมน์ chat_transport

-- Fitness Coach
INSERT INTO "agents" (
  "title",
  "description",
  "url",
  "agent_type",
  "status",
  "sort_order",
  "slug",
  "allowed_models",
  "default_model",
  "chat_transport"
)
SELECT
  'Fitness Coach',
  'โค้ชออกกำลังกายและสุขภาพ: ออกแบบโปรแกรม คำนวณ BMI/แคล อธิบายท่าออกกำลังกาย แนะนำการโปรเกรส',
  'https://boat-agent-all.atsadawat-kontha.workers.dev',
  'fitness',
  'active',
  0,
  'fitness-coach',
  '["@cf/openai/gpt-oss-20b","@cf/openai/gpt-oss-120b","@cf/meta/llama-4-scout-17b-16e-instruct","@cf/zai-org/glm-4.7-flash"]',
  '@cf/openai/gpt-oss-20b',
  'cloudflare'
WHERE NOT EXISTS (SELECT 1 FROM "agents" WHERE "slug" = 'fitness-coach');

-- Image
INSERT INTO "agents" (
  "title",
  "description",
  "url",
  "agent_type",
  "status",
  "sort_order",
  "slug",
  "allowed_models",
  "default_model",
  "chat_transport"
)
SELECT
  'Image',
  'สร้างภาพจากข้อความด้วย AI (Image generation)',
  'https://boat-agent-all.atsadawat-kontha.workers.dev',
  'image',
  'active',
  1,
  'image',
  '["@cf/zai-org/glm-4.7-flash"]',
  '@cf/zai-org/glm-4.7-flash',
  'cloudflare'
WHERE NOT EXISTS (SELECT 1 FROM "agents" WHERE "slug" = 'image');

-- Voice
INSERT INTO "agents" (
  "title",
  "description",
  "url",
  "agent_type",
  "status",
  "sort_order",
  "slug",
  "allowed_models",
  "default_model",
  "chat_transport"
)
SELECT
  'Voice',
  'แปลงข้อความเป็นเสียง (Text-to-speech)',
  'https://boat-agent-all.atsadawat-kontha.workers.dev',
  'voice',
  'active',
  2,
  'voice',
  '["@cf/zai-org/glm-4.7-flash"]',
  '@cf/zai-org/glm-4.7-flash',
  'cloudflare'
WHERE NOT EXISTS (SELECT 1 FROM "agents" WHERE "slug" = 'voice');
