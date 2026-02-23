# Database Package

Database schema and migrations using Drizzle ORM.

## ความสัมพันธ์กับ Supabase Auth

- **accounts** = ข้อมูลผู้ใช้หนึ่งแถวต่อหนึ่ง user ใน Supabase Auth  
  - `accounts.id` = `auth.users.id` (uuid เดียวกัน)
- **การสร้างแถว**: มีได้สองทาง
  1. **ในแอป**: ตอน register เรียก `createAccount(user.id)` ใน `auth.actions.ts` (ทำอยู่แล้ว)
  2. **ใน DB (แนะนำ)**: รัน `setup_supabase_accounts.sql` ใน Supabase → จะมี trigger สร้างแถวใน `accounts` ทุกครั้งที่มี user ใหม่ใน `auth.users` (เหมือนเดิมที่ profile + user_settings เชื่อมกับ auth)

## Setup Database

### 1. สร้างตาราง (migrate)

```bash
cd packages/db
# ตั้ง DATABASE_URL ใน .env ชี้ไปที่ Supabase
pnpm db:migrate
```

จะรัน `0000_initial.sql`: สร้างตาราง `accounts` และ `agents` + seed ข้อมูล agents

### 2. เชื่อม accounts กับ Supabase Auth (trigger + RLS)

ไปที่ **Supabase Dashboard → SQL Editor** แล้วรันไฟล์:

- **`src/migrations/setup_supabase_accounts.sql`**

จะได้:

- RLS บน `accounts` (ดู/แก้ไขได้เฉพาะแถวของตัวเอง)
- Trigger `on_auth_user_created`: เมื่อมี user ใหม่ใน `auth.users` จะสร้างแถวใน `accounts` ให้อัตโนมัติ

### 3. ตรวจสอบ

- ✅ ตาราง `accounts` และ `agents`
- ✅ RLS on `accounts`
- ✅ Trigger `on_auth_user_created` on `auth.users`

## Development

### อัปเดต DB ใน Supabase ให้ตรงกับ schema ปัจจุบัน

- **ใช้ migrate** (แนะนำเมื่อมี migration files อยู่แล้ว เช่น `0000_initial.sql`):  
  จะรัน migration ต่อกับ DB (สร้างตาราง `accounts`, `agents` + seed ข้อมูล agents)

  ```bash
  cd packages/db
  # ตั้ง DATABASE_URL ใน .env ให้ชี้ไปที่ Supabase (Connection string จาก Dashboard → Settings → Database)
  pnpm db:migrate
  ```

- **ใช้ generate** เฉพาะเมื่อคุณ **แก้ schema** (เช่นเพิ่มคอลัมน์/ตารางใน `schema.ts`) และต้องการสร้าง **ไฟล์ migration ใหม่** — ไม่ได้อัปเดต DB โดยตรง

  ```bash
  pnpm db:generate
  # จากนั้นรัน pnpm db:migrate เพื่อ apply ไฟล์ที่ generate
  ```

### Push Schema to Database (sync โดยตรง ไม่ใช้ไฟล์ migration)

```bash
pnpm db:push
```

ถ้าใช้ `db:push` ตาราง `agents` จะถูกสร้างจาก schema แต่จะไม่มีข้อมูล seed — ต้องรัน INSERT เองใน Supabase SQL Editor (ดู `src/migrations/0000_initial.sql`).

### Open Drizzle Studio

```bash
pnpm db:studio
```

## Usage

```typescript
import { db, accounts, agents } from "@workspace/db";
```
