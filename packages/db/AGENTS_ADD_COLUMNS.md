# เพิ่มคอลัมน์ status, sort_order, slug ในตาราง agents

ถ้ารัน `pnpm db:migrate` แล้วคอลัมน์ยังไม่ขึ้นใน database ให้ทำ **อย่างใดอย่างหนึ่ง** ด้านล่าง

---

## วิธีที่ 1: ใช้ db:push (แนะนำ – sync schema โดยตรง)

จากโฟลเดอร์ `packages/db` (และมี `DATABASE_URL` ใน `.env`):

```bash
cd packages/db
pnpm db:push
```

คำสั่งนี้จะ sync schema จาก `schema.ts` ไปที่ DB โดยตรง ทำให้ตาราง `agents` มีคอลัมน์ `status`, `sort_order`, `slug`

จากนั้นให้ backfill ค่า `slug` จาก `agent_type` ใน Supabase SQL Editor (รันครั้งเดียว):

```sql
UPDATE "agents" SET "slug" = "agent_type" WHERE "slug" IS NULL;
```

---

## วิธีที่ 2: รัน SQL เองใน Supabase

1. เปิด **Supabase Dashboard** → **SQL Editor**
2. วาง SQL ด้านล่างแล้วกด Run

```sql
ALTER TABLE "agents"
  ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active' NOT NULL,
  ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS "slug" text;

CREATE UNIQUE INDEX IF NOT EXISTS "agents_slug_unique" ON "agents" ("slug") WHERE "slug" IS NOT NULL;

UPDATE "agents" SET "slug" = "agent_type" WHERE "slug" IS NULL;
UPDATE "agents" SET "sort_order" = 0 WHERE "sort_order" IS NULL;
```

---

## วิธีที่ 3: รัน migrate อีกครั้ง

เราได้จัดโครงสร้าง migration เป็นโฟลเดอร์ `0001_agents_status_sort_slug/migration.sql` แล้ว

จากโฟลเดอร์ `packages/db`:

```bash
cd packages/db
# ตรวจสอบว่า .env มี DATABASE_URL ชี้ไปที่ Supabase
pnpm db:migrate
```

---

## ตรวจสอบผล

- เปิด **Supabase** → **Table Editor** → ตาราง **agents**
- ควรเห็นคอลัมน์: `status`, `sort_order`, `slug`
