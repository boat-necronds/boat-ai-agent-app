-- Seed finance / study / travel agents (local AI SDK proxies)
-- Ports:
-- - 3010 -> finance
-- - 3011 -> study
-- - 3012 -> travel
-- chat_transport = 'proxy' (forward ผ่าน /api/agents/[id]/chat)

INSERT INTO "agents" (
  "title",
  "description",
  "url",
  "agent_type",
  "status",
  "sort_order",
  "slug",
  "chat_transport"
)
SELECT
  'Finance Coach',
  'ที่ปรึกษาการเงินส่วนบุคคล: วางแผนงบประมาณ เป้าหมายการออม การลงทุนเบื้องต้น',
  'http://localhost:3010',
  'finance',
  'active',
  3,
  'finance',
  'proxy'
WHERE NOT EXISTS (SELECT 1 FROM "agents" WHERE "slug" = 'finance');

INSERT INTO "agents" (
  "title",
  "description",
  "url",
  "agent_type",
  "status",
  "sort_order",
  "slug",
  "chat_transport"
)
SELECT
  'Study Assistant',
  'ผู้ช่วยการเรียน: สรุปเนื้อหา ช่วยอธิบายโจทย์ ทำโน้ต/flashcard และวางแผนการอ่าน',
  'http://localhost:3011',
  'study',
  'active',
  4,
  'study',
  'proxy'
WHERE NOT EXISTS (SELECT 1 FROM "agents" WHERE "slug" = 'study');

INSERT INTO "agents" (
  "title",
  "description",
  "url",
  "agent_type",
  "status",
  "sort_order",
  "slug",
  "chat_transport"
)
SELECT
  'Travel Planner',
  'วางแผนท่องเที่ยว: ช่วยออกแบบทริป เส้นทาง สถานที่ท่องเที่ยว และงบประมาณคร่าว ๆ',
  'http://localhost:3012',
  'travel',
  'active',
  5,
  'travel',
  'proxy'
WHERE NOT EXISTS (SELECT 1 FROM "agents" WHERE "slug" = 'travel');

