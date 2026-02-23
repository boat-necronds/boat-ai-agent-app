# Accounts Table Migration

## Overview

รวม `profiles` และ `user_settings` เป็น `accounts` table เดียว เพื่อความง่ายในการจัดการ

## ขั้นตอนการ Migrate

### 1. Generate Migration (ถ้าต้องการสร้างใหม่)

```bash
cd packages/db
pnpm db:generate
```

### 2. Apply Migration

```bash
# สำหรับ local development
pnpm db:push

# หรือสำหรับ production
pnpm db:migrate
```

### 3. Verify

เช็คว่า migration สำเร็จ:

```bash
pnpm db:studio
```

## Schema Changes

### Before

```typescript
// profiles table
{
  id: uuid (PK)
  fullName: text
  username: text
  bio: text
  avatarUrl: text
  createdAt: timestamp
  updatedAt: timestamp
}

// user_settings table
{
  id: uuid (PK)
  userId: uuid (FK -> profiles.id)
  emailNotifications: boolean
  pushNotifications: boolean
  theme: text
  language: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

### After

```typescript
// accounts table
{
  id: uuid(PK);
  // Profile fields
  fullName: text;
  username: text;
  bio: text;
  avatarUrl: text;
  // Settings fields
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: text;
  language: text;
  // Timestamps
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

## Code Changes

### Import Changes

```typescript
// Before
import { profiles, userSettings, Profile, UserSettings } from "@workspace/db";

// After
import { accounts, Account } from "@workspace/db";

// หรือใช้ legacy exports (backward compatible)
import { profiles, userSettings, Profile, UserSettings } from "@workspace/db";
// profiles และ userSettings จะชี้ไปที่ accounts table
```

### Service Usage

```typescript
// ProfileService และ SettingsService ยังใช้ได้ตามเดิม
import { ProfileService, SettingsService } from "@workspace/services";

// ทั้งสอง services จะใช้ accounts table เดียวกัน
const account = await ProfileService.getProfile(userId);
const settings = await SettingsService.getSettings(userId);
// account และ settings จะเป็น object เดียวกัน
```

## Benefits

1. **ลด Complexity** - ไม่ต้อง JOIN tables
2. **Performance** - Query เร็วขึ้น
3. **Maintainability** - จัดการข้อมูลง่ายขึ้น
4. **Consistency** - ข้อมูล profile และ settings อยู่ที่เดียวกัน

## Backward Compatibility

เรายังคง export `profiles`, `userSettings`, `Profile`, และ `UserSettings` เพื่อ backward compatibility แต่แนะนำให้ใช้ `accounts` และ `Account` แทน
