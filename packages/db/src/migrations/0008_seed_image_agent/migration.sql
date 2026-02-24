-- Seed boat-agent-all agents (same URL, different slug → FitnessCoachAgent / ImageAgent / VoiceAgent)
-- Base URL: https://boat-agent-all.atsadawat-kontha.workers.dev
-- Each agent has different allowed_models / default_model to match boat-agent-all Worker.

-- Image agent (only glm-4.7-flash for chat; image gen is separate)
INSERT INTO "agents" (
  "title",
  "description",
  "url",
  "agent_type",
  "status",
  "sort_order",
  "slug",
  "type",
  "allowed_models",
  "default_model"
)
SELECT
  'Image',
  'สร้างภาพจากข้อความด้วย AI (Image generation)',
  'https://boat-agent-all.atsadawat-kontha.workers.dev',
  'image',
  'active',
  10,
  'image',
  'platform',
  '["@cf/zai-org/glm-4.7-flash"]',
  '@cf/zai-org/glm-4.7-flash'
WHERE NOT EXISTS (SELECT 1 FROM "agents" WHERE "slug" = 'image');

-- Fitness Coach agent (multiple models supported on Worker)
INSERT INTO "agents" (
  "title",
  "description",
  "url",
  "agent_type",
  "status",
  "sort_order",
  "slug",
  "type",
  "allowed_models",
  "default_model"
)
SELECT
  'Fitness Coach',
  'โค้ชออกกำลังกายและสุขภาพ (โปรไฟล์, โปรแกรม, แคล, บันทึก, เตือน)',
  'https://boat-agent-all.atsadawat-kontha.workers.dev',
  'fitness',
  'active',
  11,
  'fitness-coach',
  'platform',
  '["@cf/openai/gpt-oss-20b","@cf/openai/gpt-oss-120b","@cf/meta/llama-4-scout-17b-16e-instruct","@cf/zai-org/glm-4.7-flash"]',
  '@cf/openai/gpt-oss-20b'
WHERE NOT EXISTS (SELECT 1 FROM "agents" WHERE "slug" = 'fitness-coach');

-- Voice agent (only glm-4.7-flash for chat; TTS is separate)
INSERT INTO "agents" (
  "title",
  "description",
  "url",
  "agent_type",
  "status",
  "sort_order",
  "slug",
  "type",
  "allowed_models",
  "default_model"
)
SELECT
  'Voice',
  'แปลงข้อความเป็นเสียง (Text-to-speech)',
  'https://boat-agent-all.atsadawat-kontha.workers.dev',
  'voice',
  'active',
  12,
  'voice',
  'platform',
  '["@cf/zai-org/glm-4.7-flash"]',
  '@cf/zai-org/glm-4.7-flash'
WHERE NOT EXISTS (SELECT 1 FROM "agents" WHERE "slug" = 'voice');
