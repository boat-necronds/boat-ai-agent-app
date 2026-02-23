# Database Migration Guide

## ปัญหา

Database ยังไม่มี `accounts` table ใหม่ ยังใช้ `profiles` และ `user_settings` tables เดิมอยู่

## วิธีการ Migrate

### Option 1: Push Schema (แนะนำสำหรับ Development)

```bash
cd packages/db
pnpm db:push
```

**ข้อดี:**

- เร็วที่สุด
- ไม่ต้องสร้าง migration files
- เหมาะสำหรับ development

**ข้อเสีย:**

- ไม่มี migration history
- ไม่เหมาะสำหรับ production

### Option 2: Generate & Migrate (แนะนำสำหรับ Production)

```bash
cd packages/db

# 1. Generate migration files
pnpm db:generate

# 2. Apply migrations
pnpm db:migrate
```

**ข้อดี:**

- มี migration history
- Rollback ได้
- เหมาะสำหรับ production

**ข้อเสีย:**

- ช้ากว่า push
- ต้องจัดการ migration files

## ขั้นตอนที่แนะนำ

### 1. Backup Data (ถ้ามีข้อมูลสำคัญ)

```sql
-- Export existing data
SELECT * FROM profiles;
SELECT * FROM user_settings;
```

### 2. Run Migration

```bash
cd packages/db
pnpm db:push
```

### 3. ตรวจสอบผลลัพธ์

คุณควรเห็น output คล้ายๆ นี้:

```
✓ Pulling schema from database...
✓ Changes detected in schema
  - Drop table "user_settings"
  - Drop table "profiles"
  - Create table "accounts"

? Do you want to apply these changes? (y/N)
```

กด `y` เพื่อยืนยัน

### 4. Verify

```bash
# เปิด Drizzle Studio เพื่อดู database
pnpm db:studio
```

หรือใช้ SQL:

```sql
-- ตรวจสอบว่า accounts table ถูกสร้างแล้ว
SELECT * FROM accounts LIMIT 1;

-- ตรวจสอบว่า profiles และ user_settings หายไปแล้ว
SELECT * FROM profiles; -- Should error
SELECT * FROM user_settings; -- Should error
```

## Migration Script ที่เราสร้างไว้

เราได้สร้าง migration script ไว้แล้วที่:

- `packages/db/src/migrations/0001_merge_to_accounts.sql`

แต่ถ้าใช้ `db:push` จะไม่ใช้ file นี้ แต่จะ sync schema โดยตรง

## ถ้ามีข้อมูลเดิมอยู่

### Migrate Data Manually

```sql
-- 1. สร้าง accounts table
CREATE TABLE accounts (
  id uuid PRIMARY KEY,
  full_name text,
  username text UNIQUE,
  bio text,
  avatar_url text,
  email_notifications boolean DEFAULT true NOT NULL,
  push_notifications boolean DEFAULT true NOT NULL,
  theme text DEFAULT 'system' NOT NULL,
  language text DEFAULT 'th' NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- 2. Copy data จาก profiles และ user_settings
INSERT INTO accounts (
  id,
  full_name,
  username,
  bio,
  avatar_url,
  email_notifications,
  push_notifications,
  theme,
  language,
  created_at,
  updated_at
)
SELECT
  p.id,
  p.full_name,
  p.username,
  p.bio,
  p.avatar_url,
  COALESCE(us.email_notifications, true),
  COALESCE(us.push_notifications, true),
  COALESCE(us.theme, 'system'),
  COALESCE(us.language, 'th'),
  p.created_at,
  GREATEST(p.updated_at, COALESCE(us.updated_at, p.updated_at))
FROM profiles p
LEFT JOIN user_settings us ON us.user_id = p.id;

-- 3. ลบ tables เดิม
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS profiles;
```

## Troubleshooting

### Error: "relation 'accounts' does not exist"

**สาเหตุ:** Migration ยังไม่ทำ

**แก้ไข:**

```bash
cd packages/db
pnpm db:push
```

### Error: "DATABASE_URL is not defined"

**สาเหตุ:** ไม่มี environment variable

**แก้ไข:**

```bash
# ตรวจสอบว่ามี .env file
cat packages/db/.env

# ถ้าไม่มี ให้สร้าง
echo 'DATABASE_URL="your-connection-string"' > packages/db/.env
```

### Error: "Cannot connect to database"

**สาเหตุ:** Connection string ผิดหรือ database ไม่ online

**แก้ไข:**

1. ตรวจสอบ DATABASE_URL ใน `.env`
2. ตรวจสอบว่า Supabase project online
3. ตรวจสอบ network connection

### Error: "Table already exists"

**สาเหตุ:** มี accounts table อยู่แล้ว

**แก้ไข:**

```sql
-- ลบ table เดิม (ระวัง: จะเสียข้อมูล)
DROP TABLE IF EXISTS accounts CASCADE;

-- แล้ว run migration ใหม่
```

## Quick Commands

```bash
# Navigate to db package
cd packages/db

# Push schema (fastest)
pnpm db:push

# Generate migration
pnpm db:generate

# Apply migration
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio
```

## Environment Variables

ตรวจสอบว่ามี DATABASE_URL ใน:

1. **packages/db/.env**

   ```
   DATABASE_URL="postgresql://..."
   ```

2. **apps/web/.env.local**
   ```
   DATABASE_URL="postgresql://..."
   NEXT_PUBLIC_SUPABASE_URL="..."
   NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
   ```

## After Migration

### 1. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
# Start again
pnpm dev
```

### 2. Test Registration

1. ไปที่ `/register`
2. สร้าง user ใหม่
3. ตรวจสอบว่า account ถูกสร้างใน database

### 3. Test Login

1. ไปที่ `/login`
2. Login ด้วย user ที่สร้าง
3. ควรเข้าสู่ dashboard ได้

### 4. Check Database

```bash
pnpm db:studio
```

ดูว่า accounts table มีข้อมูลถูกต้อง

## Migration Checklist

- [ ] Backup ข้อมูลเดิม (ถ้ามี)
- [ ] ตรวจสอบ DATABASE_URL
- [ ] Run `pnpm db:push`
- [ ] ยืนยัน changes
- [ ] Verify ด้วย `pnpm db:studio`
- [ ] Restart dev server
- [ ] Test registration
- [ ] Test login
- [ ] Test dashboard

## Common Issues

### Issue 1: "No changes detected"

**สาเหตุ:** Schema ตรงกับ database อยู่แล้ว

**แก้ไข:** ไม่ต้องทำอะไร database ถูกต้องแล้ว

### Issue 2: "Migration failed"

**สาเหตุ:** มี constraint หรือ foreign key ขัดแย้ง

**แก้ไข:**

```sql
-- ลบ constraints ก่อน
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_profiles_id_fk;

-- แล้ว run migration ใหม่
```

### Issue 3: "Data loss warning"

**สาเหตุ:** Migration จะลบข้อมูล

**แก้ไข:**

1. Backup ข้อมูลก่อน
2. หรือใช้ manual migration script ด้านบน

## Next Steps

หลังจาก migrate แล้ว:

1. **Test ทุก features** - ตรวจสอบว่าทุกอย่างทำงานได้
2. **Update documentation** - อัพเดท docs ให้ตรงกับ schema ใหม่
3. **Remove legacy code** - ลบ code ที่ใช้ profiles/userSettings เดิม
4. **Monitor errors** - ดู logs ว่ามี error ไหม

## Help

ถ้ายังมีปัญหา:

1. ดู logs จาก `pnpm db:push`
2. ตรวจสอบ DATABASE_URL
3. ลอง connect ด้วย SQL client
4. ดู Supabase dashboard → Database
