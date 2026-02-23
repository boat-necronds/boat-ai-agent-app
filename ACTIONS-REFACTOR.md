# Actions Refactor - แยก Folder ตาม Domain

## สรุปการเปลี่ยนแปลง

ย้าย Server Actions ออกจาก `app/actions/` มาอยู่ที่ `actions/` และจัดระเบียบตาม domain

## โครงสร้างเดิม

```
apps/web/
├── app/
│   └── actions/
│       ├── auth.ts
│       └── account.ts
```

## โครงสร้างใหม่

```
apps/web/
├── actions/
│   ├── auth/
│   │   ├── auth.actions.ts
│   │   └── index.ts
│   ├── account/
│   │   ├── account.actions.ts
│   │   └── index.ts
│   └── README.md
```

## ข้อดี

### 1. แยกออกจาก App Router

- Actions ไม่ใช่ส่วนหนึ่งของ routing
- ชัดเจนว่าเป็น Server Actions ไม่ใช่ API routes

### 2. จัดระเบียบตาม Domain

- แต่ละ domain มี folder ของตัวเอง
- ง่ายต่อการหาและจัดการ
- เพิ่ม domain ใหม่ได้ง่าย

### 3. Scalable

```
actions/
├── auth/           # Authentication
├── account/        # User account
├── posts/          # Blog posts (future)
├── comments/       # Comments (future)
└── notifications/  # Notifications (future)
```

### 4. Clear Naming

- ไฟล์: `{domain}.actions.ts`
- Function: `{verb}{Noun}Action`
- Import: `@/actions/{domain}`

## การเปลี่ยนแปลง Import

### Before

```typescript
import { loginAction } from "@/app/actions/auth";
import { updateAccountAction } from "@/app/actions/account";
```

### After

```typescript
import { loginAction } from "@/actions/auth";
import { updateAccountAction } from "@/actions/account";
```

## ไฟล์ที่เปลี่ยนแปลง

### ย้าย

- `app/actions/auth.ts` → `actions/auth/auth.actions.ts`
- `app/actions/account.ts` → `actions/account/account.actions.ts`

### สร้างใหม่

- `actions/auth/index.ts`
- `actions/account/index.ts`
- `actions/README.md`

### อัพเดท Imports

- `components/dashboard/nav-user.tsx`
- `components/auth/register-form.tsx`
- `components/auth/login-form.tsx`

## Naming Convention

### Domain Folder

- ใช้ชื่อ singular (auth, account, post, comment)
- ใช้ lowercase
- ตรงกับ business domain

### Action File

- Format: `{domain}.actions.ts`
- ตัวอย่าง: `auth.actions.ts`, `account.actions.ts`, `post.actions.ts`

### Action Function

- Format: `{verb}{Noun}Action`
- ตัวอย่าง:
  - `loginAction`, `registerAction`, `logoutAction`
  - `createPostAction`, `updatePostAction`, `deletePostAction`
  - `uploadAvatarAction`, `deleteAvatarAction`

### Index File

- แต่ละ domain มี `index.ts`
- Re-export ทุก actions จาก `*.actions.ts`

```typescript
// actions/auth/index.ts
export * from "./auth.actions";
```

## เพิ่ม Domain ใหม่

### 1. สร้าง Folder Structure

```bash
mkdir actions/posts
touch actions/posts/posts.actions.ts
touch actions/posts/index.ts
```

### 2. เขียน Actions

```typescript
// actions/posts/posts.actions.ts
"use server";

import { authAction } from "@/lib/safe-action";
import { postSchema } from "@workspace/validations";
import { createPost } from "@workspace/services";
import { revalidatePath } from "next/cache";

export const createPostAction = authAction
  .schema(postSchema)
  .action(async ({ parsedInput, ctx }) => {
    const post = await createPost(ctx.user.id, parsedInput);
    revalidatePath("/posts");
    return { success: true, post };
  });
```

### 3. Export

```typescript
// actions/posts/index.ts
export * from "./posts.actions";
```

### 4. ใช้งาน

```typescript
import { createPostAction } from "@/actions/posts";
```

## Best Practices

### 1. Server Actions Only

- ใช้ `"use server"` directive
- ไม่ใช่ API routes
- ไม่ใช่ client-side functions

### 2. Validation

- ใช้ zod schema validation
- Validate ทุก input
- Return type-safe errors

### 3. Error Handling

```typescript
// ✅ Good
return { success: false, error: "User-friendly message" };

// ❌ Bad
throw new Error("Technical error message");
```

### 4. Revalidation

```typescript
// Revalidate หลังจากเปลี่ยนแปลงข้อมูล
revalidatePath("/posts");
revalidatePath(`/posts/${id}`);
revalidatePath("/", "layout");
```

### 5. Consistent Response

```typescript
// Success
return { success: true, data: result };

// Error
return { success: false, error: "Error message" };
```

## TypeScript Configuration

tsconfig.json รองรับ `@/actions/*` อยู่แล้วผ่าน `@/*` mapping:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Testing

### Unit Tests

```typescript
// actions/auth/__tests__/auth.actions.test.ts
import { loginAction } from "../auth.actions";

describe("loginAction", () => {
  it("should login successfully", async () => {
    // Test implementation
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/auth.test.ts
import { loginAction } from "@/actions/auth";

describe("Auth Integration", () => {
  it("should complete login flow", async () => {
    // Test implementation
  });
});
```

## Migration Checklist

- [x] สร้าง `actions/` folder structure
- [x] ย้าย auth actions
- [x] ย้าย account actions
- [x] สร้าง index.ts files
- [x] อัพเดท imports ใน components
- [x] ลบ `app/actions/` เดิม
- [x] สร้าง README.md
- [x] Test ว่า actions ทำงานได้

## ตัวอย่าง Domains ที่อาจเพิ่มในอนาคต

```
actions/
├── auth/           # ✅ มีแล้ว
├── account/        # ✅ มีแล้ว
├── posts/          # Blog posts management
├── comments/       # Comment system
├── likes/          # Like/Unlike actions
├── follows/        # Follow/Unfollow users
├── notifications/  # Notification management
├── search/         # Search actions
├── upload/         # File upload actions
└── admin/          # Admin-only actions
```
