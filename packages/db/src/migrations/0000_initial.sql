-- Drop old tables (if any) then create current schema: accounts + agents
DROP TABLE IF EXISTS "user_settings";
DROP TABLE IF EXISTS "profiles";
DROP TABLE IF EXISTS "agents";
DROP TABLE IF EXISTS "accounts";

CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text,
	"username" text,
	"bio" text,
	"avatar_url" text,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"push_notifications" boolean DEFAULT true NOT NULL,
	"theme" text DEFAULT 'system' NOT NULL,
	"language" text DEFAULT 'th' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_username_unique" UNIQUE("username")
);

CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"agent_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Seed agents for chatbot
INSERT INTO "agents" ("title", "description", "url", "agent_type") VALUES
  ('โค้ชออกกำลังกาย', 'เก็บเป้าหมาย/โปรไฟล์, ออกแบบโปรแกรม, คำนวณแคล, บันทึกการออกกำลังกาย, ตั้งเตือน', 'https://boat-ai-agent-2.atsadawat-kontha.workers.dev', 'fitness'),
  ('Food Pro', 'Agent ด้านอาหารและโภชนาการ', 'https://boat-ai-agent-food-pro.atsadawat-kontha.workers.dev', 'food');
