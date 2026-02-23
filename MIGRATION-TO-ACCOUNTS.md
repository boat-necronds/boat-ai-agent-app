# Migration: รวม Profiles และ User Settings เป็น Accounts Table

## สิ่งที่เปลี่ยนแปลง

เราได้รวม `profiles` และ `user_settings` tables เป็น `accounts` table เดียว เพื่อลดความซับซ้อนและทำให้จัดการข้อมูลผู้ใช้ง่ายขึ้น

### Schema เดิม

- `profiles` - เก็บข้อมูล profile (fullName, username, bio, avatarUrl)
- `user_settings` - เก็บการตั้งค่า (emailNotifications, pushNotifications, theme, language)

### Schema ใหม่

- `accounts` - รวมทั้ง profile และ settings ไว้ใน table เดียว

## วิธีการ Migrate

### 1. Run Migration

```bash
cd packages/db
pnpm db:migrate
```

หรือถ้าใช้ Supabase:

```bash
cd packages/db
pnpm db:push
```

### 2. ตรวจสอบ Migration

Migration จะทำการ:

1. สร้าง `accounts` table ใหม่
2. Copy ข้อมูลจาก `profiles` และ `user_settings` มารวมกัน
3. ลบ `profiles` และ `user_settings` tables เดิม

### 3. ข้อมูลที่ถูก Migrate

- ข้อมูล profile ทั้งหมดจะถูกย้ายมา
- ข้อมูล settings จะถูก merge (ถ้าไม่มี settings จะใช้ค่า default)
- `updated_at` จะใช้ค่าล่าสุดระหว่าง profile และ settings

## การเปลี่ยนแปลงใน Code

### Services

- `ProfileService` - ยังใช้ได้ตามเดิม แต่ใช้ `accounts` table แทน
- `SettingsService` - ยังใช้ได้ตามเดิม แต่ใช้ `accounts` table แทน

### Types

- `Account` - type ใหม่ที่รวม profile และ settings
- `Profile` และ `UserSettings` - ยังมีอยู่เพื่อ backward compatibility (alias ของ Account)

### Actions

- `registerAction` - ปรับให้สร้าง account เดียวแทนที่จะสร้าง profile และ settings แยกกัน
- `updateProfileAction` - ยังใช้ได้ตามเดิม
- `updateSettingsAction` - ยังใช้ได้ตามเดิม

## Rollback (ถ้าจำเป็น)

ถ้าต้องการ rollback:

```bash
cd packages/db
# ใช้ migration เดิม
pnpm db:migrate --to 0000
```

## หมายเหตุ

- ข้อมูลเดิมจะถูกรักษาไว้ทั้งหมด
- API ยังคงเหมือนเดิม ไม่ต้องเปลี่ยน frontend code
- Performance ดีขึ้นเพราะไม่ต้อง JOIN tables
