# 🗄️ Setup Database ใน Supabase

## ⚠️ สำคัญ: คุณต้องรัน SQL migrations ด้วยตัวเองใน Supabase

Migration files ที่ generate ไว้จะไม่ถูกรันอัตโนมัติ คุณต้องไปรันใน Supabase SQL Editor

---

## 📋 ขั้นตอนการ Setup (ทำตามลำดับ)

### 1️⃣ เปิด Supabase Dashboard

1. ไปที่ [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. เลือก Project ของคุณ
3. ไปที่เมนู **SQL Editor** (ด้านซ้าย)

### 2️⃣ รัน Migration แรก (สร้าง Tables)

คลิก **New Query** แล้ว copy SQL ด้านล่างนี้ทั้งหมดแล้ววาง:

```sql
-- สร้าง tables: profiles และ user_settings
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text,
	"username" text,
	"bio" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);

CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"push_notifications" boolean DEFAULT true NOT NULL,
	"theme" text DEFAULT 'system' NOT NULL,
	"language" text DEFAULT 'th' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);

ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_profiles_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
```

กด **Run** (หรือ Ctrl+Enter)

### 3️⃣ รัน Setup Script (RLS Policies + Triggers)

สร้าง **New Query** อีกอันแล้ว copy SQL ด้านล่างนี้:

```sql
-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Settings RLS Policies
CREATE POLICY "Users can manage own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, bio, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NULL,
    NULL,
    NULL
  );

  INSERT INTO public.user_settings (user_id, email_notifications, push_notifications, theme, language)
  VALUES (
    NEW.id,
    true,
    true,
    'system',
    'th'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

กด **Run** (หรือ Ctrl+Enter)

---

## ✅ ตรวจสอบว่า Setup สำเร็จ

### ตรวจสอบ Tables

ไปที่ **Table Editor** (เมนูด้านซ้าย) คุณควรเห็น:

- ✅ `profiles` table
- ✅ `user_settings` table

### ตรวจสอบ RLS Policies

ไปที่ **Authentication** → **Policies** คุณควรเห็น:

- ✅ Policies สำหรับ `profiles` (3 policies)
- ✅ Policies สำหรับ `user_settings` (1 policy)

### ตรวจสอบ Trigger

ไปที่ **Database** → **Triggers** คุณควรเห็น:

- ✅ `on_auth_user_created` trigger

---

## 🎯 ทำไมต้องทำแบบนี้?

Drizzle ORM ใช้สำหรับ:

- ✅ Define schema ใน TypeScript (type-safe)
- ✅ Generate migration files
- ✅ Query database แบบ type-safe

แต่ Drizzle **ไม่สามารถรัน migrations โดยตรงกับ Supabase** เพราะ:

- ❌ Supabase ไม่ให้ direct database access สำหรับ migrations
- ❌ ต้องใช้ Supabase SQL Editor หรือ Supabase CLI

---

## 🔄 เมื่อมี Schema เปลี่ยนแปลงในอนาคต

1. แก้ไข `packages/db/src/schema.ts`
2. รัน `pnpm db:generate` เพื่อสร้าง migration file ใหม่
3. ไปที่ Supabase SQL Editor แล้วรัน SQL จาก migration file ที่สร้างใหม่
4. หรือใช้ `pnpm db:push` เพื่อ push schema โดยตรง (ไม่แนะนำใน production)

---

## 📚 อ้างอิง

- Migration files อยู่ที่: `packages/db/src/migrations/`
- Schema definition: `packages/db/src/schema.ts`
- Drizzle config: `packages/db/drizzle.config.ts`
