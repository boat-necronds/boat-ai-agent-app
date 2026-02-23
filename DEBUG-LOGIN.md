# Debug Login Issue

## Logging เพิ่มเติม

เพิ่ม console.log ในทุกจุดของ login flow เพื่อ debug

## จุดที่เพิ่ม Logging

### 1. Client-Side (Login Form)

**File:** `apps/web/components/auth/login-form.tsx`

```typescript
const onSubmit = (data: LoginInput) => {
  console.log("📝 Login form submitted:", { email: data.email });
  execute(data);
};

const { execute, isExecuting } = useAction(loginAction, {
  onSuccess: ({ data }) => {
    console.log("✅ Login action success:", data);
  },
  onError: ({ error }) => {
    console.error("❌ Login action error:", error);
    toast.error(error.serverError || "Failed to login");
  },
});
```

### 2. Server Action (Login)

**File:** `apps/web/actions/auth/auth.actions.ts`

```typescript
export const loginAction = action
  .schema(loginSchema)
  .action(async ({ parsedInput }) => {
    console.log("🔐 Login action started", { email: parsedInput.email });

    const supabase = await createClient();

    console.log("📡 Attempting Supabase signInWithPassword...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsedInput.email,
      password: parsedInput.password,
    });

    console.log("📧 Supabase signIn response:", {
      hasUser: !!data.user,
      hasSession: !!data.session,
      userId: data.user?.id,
      error: error?.message,
      errorDetails: error,
    });

    if (error) {
      console.error("❌ Supabase signIn error:", error);
      return { success: false, error: error.message };
    }

    if (!data.user || !data.session) {
      console.error("❌ No user or session returned");
      return { success: false, error: "Login failed - no session created" };
    }

    console.log("✅ Login successful, revalidating paths...");
    revalidatePath("/", "layout");

    console.log("🔄 Redirecting to dashboard...");
    redirect("/dashboard");
  });
```

### 3. Dashboard Layout (Auth Guard)

**File:** `apps/web/app/(dashboard)/layout.tsx`

```typescript
export default async function DashboardLayout({ children }) {
  console.log("🏠 Dashboard layout rendering...");

  const supabase = await createClient();

  console.log("🔍 Checking authentication...");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log("👤 Auth check result:", {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    error: error?.message,
  });

  if (error || !user) {
    console.log("❌ Not authenticated, redirecting to login...");
    redirect("/login");
  }

  console.log("📊 Fetching user account...");
  const account = await getAccount(user.id);
  console.log("✅ Account fetched:", {
    hasAccount: !!account,
    fullName: account?.fullName,
  });

  // ...
}
```

### 4. Account Service

**File:** `packages/services/src/account/account.service.ts`

```typescript
export async function getAccount(userId: string): Promise<Account | null> {
  try {
    console.log("🔍 Getting account for user:", userId);
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, userId))
      .limit(1);

    console.log("✅ Account query result:", {
      found: !!account,
      fullName: account?.fullName,
    });

    return account || null;
  } catch (error) {
    console.error("❌ Error getting account:", error);
    throw error;
  }
}
```

## วิธีการ Debug

### 1. เปิด Browser Console

- กด F12 หรือ Right Click > Inspect
- ไปที่ tab Console

### 2. เปิด Terminal/Server Logs

- ดู terminal ที่รัน `pnpm dev`
- Server-side logs จะแสดงที่นี่

### 3. ทดสอบ Login

1. ไปที่หน้า login
2. กรอก email และ password
3. กด Sign in
4. ดู logs ทั้ง browser console และ terminal

## Expected Log Flow (Success)

### Browser Console:

```
📝 Login form submitted: { email: "user@example.com" }
✅ Login action success: { ... }
```

### Server Terminal:

```
🔐 Login action started { email: "user@example.com" }
📡 Attempting Supabase signInWithPassword...
📧 Supabase signIn response: { hasUser: true, hasSession: true, userId: "..." }
✅ Login successful, revalidating paths...
🔄 Redirecting to dashboard...
🏠 Dashboard layout rendering...
🔍 Checking authentication...
👤 Auth check result: { hasUser: true, userId: "...", email: "..." }
📊 Fetching user account...
🔍 Getting account for user: ...
✅ Account query result: { found: true, fullName: "..." }
✅ Account fetched: { hasAccount: true, fullName: "..." }
```

## Common Issues

### 1. Invalid Credentials

```
❌ Supabase signIn error: { message: "Invalid login credentials" }
```

**Solution:** ตรวจสอบ email/password ให้ถูกต้อง

### 2. No Session Created

```
❌ No user or session returned
```

**Solution:**

- ตรวจสอบ Supabase configuration
- ตรวจสอบ cookies settings
- ตรวจสอบ CORS settings

### 3. Account Not Found

```
✅ Account query result: { found: false }
```

**Solution:**

- User ยังไม่มี account record
- ต้อง register ใหม่หรือ run migration

### 4. Database Connection Error

```
❌ Error getting account: { ... }
```

**Solution:**

- ตรวจสอบ DATABASE_URL
- ตรวจสอบ database connection
- ตรวจสอบว่า migration ทำแล้ว

### 5. Redirect Loop

```
🏠 Dashboard layout rendering...
❌ Not authenticated, redirecting to login...
🏠 Dashboard layout rendering...
❌ Not authenticated, redirecting to login...
```

**Solution:**

- Session ไม่ถูก persist
- ตรวจสอบ cookie settings
- ตรวจสอบ Supabase client configuration

## ตรวจสอบ Configuration

### 1. Environment Variables

```bash
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=your-database-url
```

### 2. Supabase Client

```typescript
// packages/supabase/src/server.ts
// ตรวจสอบว่า cookies configuration ถูกต้อง
```

### 3. Database Migration

```bash
cd packages/db
pnpm db:push
```

### 4. Account Table

```sql
-- ตรวจสอบว่า accounts table มีอยู่
SELECT * FROM accounts LIMIT 1;
```

## Next Steps

1. **ทดสอบ Login** - ดู logs ทั้งหมด
2. **ระบุจุดที่ fail** - ดูว่า error เกิดที่ไหน
3. **แก้ไขตามปัญหา** - ใช้ solutions ด้านบน
4. **ลบ Logs** - หลังจาก debug เสร็จแล้ว

## Remove Logs (After Debug)

หลังจากแก้ปัญหาเสร็จแล้ว ควรลบ console.log ออก:

```bash
# Search for console.log
grep -r "console.log" apps/web/actions
grep -r "console.log" apps/web/components/auth
grep -r "console.log" apps/web/app/\(dashboard\)
grep -r "console.log" packages/services
```

หรือใช้ regex replace:

```
Find: console\.log\([^)]+\);\n?
Replace: (empty)
```
