# Account Service Refactor

## สรุปการเปลี่ยนแปลง

เปลี่ยนจาก class-based services เป็น function-based และรวม ProfileService และ SettingsService เป็น account service เดียว

## เปลี่ยนจาก Class เป็น Function

### Before (Class-based)

```typescript
// ProfileService
export class ProfileService {
  static async getProfile(userId: string): Promise<Profile | null> {}
  static async updateProfile(
    userId: string,
    data: ProfileInput,
  ): Promise<Profile> {}
  static async createProfile(userId: string, email: string): Promise<Profile> {}
  static async updateAvatar(
    userId: string,
    avatarUrl: string,
  ): Promise<Profile> {}
}

// SettingsService
export class SettingsService {
  static async getSettings(userId: string): Promise<UserSettings | null> {}
  static async updateSettings(
    userId: string,
    data: SettingsInput,
  ): Promise<UserSettings> {}
  static async createSettings(userId: string): Promise<UserSettings> {}
}
```

### After (Function-based)

```typescript
// account.service.ts
export async function getAccount(userId: string): Promise<Account | null> {}
export async function createAccount(userId: string): Promise<Account> {}
export async function updateAccount(
  userId: string,
  data: Partial<Omit<Account, "id" | "createdAt" | "updatedAt">>,
): Promise<Account> {}
```

## ข้อดีของ Function-based

1. **ง่ายกว่า** - ไม่ต้องใช้ class และ static methods
2. **Tree-shaking ดีกว่า** - import เฉพาะ function ที่ใช้
3. **Type-safe** - ใช้ Partial<Omit<>> เพื่อป้องกันการแก้ไข id และ timestamps
4. **Flexible** - updateAccount รับทั้ง profile และ settings fields

## การใช้งาน

### Import

```typescript
// Before
import { ProfileService, SettingsService } from "@workspace/services";

// After
import { getAccount, updateAccount, createAccount } from "@workspace/services";
```

### Get Account

```typescript
// Before
const profile = await ProfileService.getProfile(userId);
const settings = await SettingsService.getSettings(userId);

// After
const account = await getAccount(userId);
// account มีทั้ง profile และ settings fields
```

### Update Account

```typescript
// Before
await ProfileService.updateProfile(userId, { fullName: "John" });
await SettingsService.updateSettings(userId, { theme: "dark" });

// After
// อัพเดทได้ทั้ง profile และ settings ในครั้งเดียว
await updateAccount(userId, {
  fullName: "John",
  theme: "dark",
});

// หรืออัพเดทแยกก็ได้
await updateAccount(userId, { fullName: "John" });
await updateAccount(userId, { theme: "dark" });
```

### Upload Avatar

```typescript
// ใช้ updateAccount แทน updateAvatar
await updateAccount(userId, { avatarUrl: "https://..." });
```

## Actions

### New Account Actions

```typescript
// apps/web/app/actions/account.ts
export const updateAccountAction = authAction
  .schema(accountSchema)
  .action(async ({ parsedInput, ctx }) => {
    const updatedAccount = await updateAccount(ctx.user.id, parsedInput);
    revalidatePath("/profile");
    revalidatePath("/settings");
    return { success: true, account: updatedAccount };
  });

export const uploadAvatarAction = authAction
  .schema(accountSchema.pick({ avatarUrl: true }))
  .action(async ({ parsedInput, ctx }) => {
    const updatedAccount = await updateAccount(ctx.user.id, {
      avatarUrl: parsedInput.avatarUrl,
    });
    revalidatePath("/profile");
    return { success: true, account: updatedAccount };
  });

export const deleteAvatarAction = authAction.action(async ({ ctx }) => {
  // ลบไฟล์จาก Supabase Storage
  // อัพเดท database
  const updatedAccount = await updateAccount(ctx.user.id, {
    avatarUrl: null,
  });
  revalidatePath("/profile");
  return { success: true, account: updatedAccount };
});
```

## Validations

### New Account Schema

```typescript
// รวม profile และ settings schema
export const accountSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.string().optional(),
});

// Legacy schemas ยังใช้ได้
export const profileSchema = accountSchema.pick({
  fullName: true,
  username: true,
  bio: true,
});

export const settingsSchema = accountSchema.pick({
  emailNotifications: true,
  pushNotifications: true,
  theme: true,
  language: true,
});
```

## Image Upload Flow

1. **Client-side**: Upload image ไปที่ Supabase Storage
2. **Get URL**: รับ public URL กลับมา
3. **Update Account**: เรียก `uploadAvatarAction` พร้อม avatarUrl
4. **Database**: บันทึก URL ลง accounts table

```typescript
// Example client-side code
const file = event.target.files[0];

// Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from("avatars")
  .upload(`${userId}/${file.name}`, file);

if (data) {
  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(data.path);

  // Update account with avatar URL
  await uploadAvatarAction({ avatarUrl: publicUrl });
}
```

## Migration Checklist

- [x] สร้าง account service ใหม่ (function-based)
- [x] สร้าง account actions (updateAccount, uploadAvatar, deleteAvatar)
- [x] อัพเดท validations (accountSchema)
- [x] อัพเดท auth action (ใช้ createAccount)
- [x] อัพเดท dashboard layout (ใช้ getAccount)
- [x] อัพเดท profile page (ใช้ getAccount)
- [x] อัพเดท settings page (ใช้ getAccount)
- [x] ลบ profile และ settings actions เดิม
- [x] ลบ ProfileService และ SettingsService

## ไฟล์ที่เปลี่ยนแปลง

### ใหม่

- `packages/services/src/account/account.service.ts`
- `packages/services/src/account/index.ts`
- `apps/web/app/actions/account.ts`

### แก้ไข

- `packages/services/src/index.ts`
- `packages/validations/src/profile.ts`
- `apps/web/app/actions/auth.ts`
- `apps/web/app/(dashboard)/layout.tsx`
- `apps/web/app/(dashboard)/profile/page.tsx`
- `apps/web/app/(dashboard)/settings/page.tsx`

### ลบ

- `apps/web/app/actions/profile.ts`
- `apps/web/app/actions/settings.ts`
- `packages/services/src/user/profile.service.ts`
- `packages/services/src/user/settings.service.ts`
