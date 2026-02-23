# Actions Directory

โครงสร้าง Server Actions ที่จัดระเบียบตาม domain

## โครงสร้าง

```
actions/
├── auth/
│   ├── auth.actions.ts    # Login, Register, Logout actions
│   └── index.ts
├── account/
│   ├── account.actions.ts # Update account, Upload/Delete avatar
│   └── index.ts
└── README.md
```

## หลักการจัดระเบียบ

### 1. แยกตาม Domain

แต่ละ domain มี folder ของตัวเอง:

- `auth/` - Authentication related actions
- `account/` - User account management actions
- เพิ่ม domain อื่นๆ ตามต้องการ เช่น `posts/`, `comments/`, `notifications/`

### 2. Naming Convention

- ไฟล์: `{domain}.actions.ts` (เช่น `auth.actions.ts`, `account.actions.ts`)
- Function: `{verb}{Noun}Action` (เช่น `loginAction`, `updateAccountAction`)

### 3. Export Pattern

แต่ละ domain folder มี `index.ts` เพื่อ re-export:

```typescript
// actions/auth/index.ts
export * from "./auth.actions";
```

## การใช้งาน

### Import Actions

```typescript
// ✅ Good - Import จาก domain folder
import { loginAction, registerAction } from "@/actions/auth";
import { updateAccountAction, uploadAvatarAction } from "@/actions/account";

// ❌ Bad - Import โดยตรงจากไฟล์
import { loginAction } from "@/actions/auth/auth.actions";
```

### ใน Components

```typescript
"use client";

import { loginAction } from "@/actions/auth";
import { useAction } from "next-safe-action/hooks";

export function LoginForm() {
  const { execute, isExecuting } = useAction(loginAction, {
    onSuccess: ({ data }) => {
      // Handle success
    },
    onError: ({ error }) => {
      // Handle error
    },
  });

  const onSubmit = (data) => {
    execute(data);
  };

  // ...
}
```

## Actions ที่มีอยู่

### Auth Actions (`@/actions/auth`)

- `loginAction` - Login with email/password
- `registerAction` - Register new user
- `logoutAction` - Logout current user

### Account Actions (`@/actions/account`)

- `updateAccountAction` - Update account profile and settings
- `uploadAvatarAction` - Upload and update avatar URL
- `deleteAvatarAction` - Delete avatar from storage and database

## เพิ่ม Domain ใหม่

1. สร้าง folder ใหม่ใน `actions/`
2. สร้างไฟล์ `{domain}.actions.ts`
3. สร้าง `index.ts` เพื่อ export
4. เขียน actions ด้วย `"use server"` directive

### ตัวอย่าง: Posts Domain

```typescript
// actions/posts/posts.actions.ts
"use server";

import { authAction } from "@/lib/safe-action";
import { postSchema } from "@workspace/validations";
import { createPost, updatePost, deletePost } from "@workspace/services";
import { revalidatePath } from "next/cache";

export const createPostAction = authAction
  .schema(postSchema)
  .action(async ({ parsedInput, ctx }) => {
    const post = await createPost(ctx.user.id, parsedInput);
    revalidatePath("/posts");
    return { success: true, post };
  });

export const updatePostAction = authAction
  .schema(postSchema)
  .action(async ({ parsedInput, ctx }) => {
    const post = await updatePost(parsedInput.id, parsedInput);
    revalidatePath(`/posts/${post.id}`);
    return { success: true, post };
  });

export const deletePostAction = authAction.action(
  async ({ parsedInput: { id }, ctx }) => {
    await deletePost(id, ctx.user.id);
    revalidatePath("/posts");
    return { success: true };
  },
);
```

```typescript
// actions/posts/index.ts
export * from "./posts.actions";
```

## Best Practices

1. **ใช้ "use server" directive** - ทุก action file ต้องมี `"use server"` ที่บรรทัดแรก

2. **Validate Input** - ใช้ schema validation ด้วย zod

3. **Handle Errors** - Return error messages ที่เป็นมิตรกับผู้ใช้

4. **Revalidate Paths** - ใช้ `revalidatePath()` หลังจากเปลี่ยนแปลงข้อมูล

5. **Type Safety** - Export types จาก validations package

6. **Consistent Response** - Return object ที่มี `success` และ data/error

```typescript
// ✅ Good
return { success: true, data: result };
return { success: false, error: "Error message" };

// ❌ Bad
return result;
throw new Error("Error message");
```

## ข้อดีของโครงสร้างนี้

1. **ง่ายต่อการหา** - รู้ทันทีว่า action อยู่ที่ไหน
2. **Scalable** - เพิ่ม domain ใหม่ได้ง่าย
3. **Maintainable** - แก้ไขและ test ง่าย
4. **Clear Ownership** - แต่ละ domain มีความรับผิดชอบชัดเจน
5. **Better Imports** - Import path สั้นและชัดเจน
