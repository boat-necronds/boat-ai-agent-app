# Error Handling Fix - แสดง Error Toast ทุกกรณี

## ปัญหา

Error จาก Supabase (เช่น password ผิด) ไม่แสดง toast notification

## สาเหตุ

`next-safe-action` มี 2 ช่องทางในการ return error:

1. **onError callback** - เมื่อเกิด exception หรือ validation error
2. **result.data** - เมื่อ action return `{ success: false, error: "..." }`

เดิมเราจัดการแค่ `onError` เท่านั้น ทำให้ error ที่ return จาก action ไม่แสดง toast

## การแก้ไข

### 1. Login Form

**File:** `apps/web/components/auth/login-form.tsx`

```typescript
import { useEffect } from "react";

export function LoginForm() {
  const { execute, isExecuting, result } = useAction(loginAction, {
    onSuccess: ({ data }) => {
      console.log("✅ Login action success:", data);
    },
    onError: ({ error }) => {
      console.error("❌ Login action error:", error);

      // จัดการ error จาก onError callback
      const errorMessage =
        error.serverError || "Failed to login. Please try again.";

      toast.error(errorMessage);
    },
  });

  // จัดการ error จาก result.data
  useEffect(() => {
    if (
      result.data &&
      "success" in result.data &&
      !result.data.success &&
      "error" in result.data
    ) {
      toast.error(result.data.error as string);
    }
  }, [result]);

  // ...
}
```

### 2. Register Form

**File:** `apps/web/components/auth/register-form.tsx`

```typescript
import { useEffect } from "react";

export function RegisterForm() {
  const { execute, isExecuting, result } = useAction(registerAction, {
    onSuccess: ({ data }) => {
      console.log("✅ Register action success:", data);
      if (data?.success && data.message) {
        toast.success(data.message);
        router.push("/login");
      }
    },
    onError: ({ error }) => {
      console.error("❌ Register action error:", error);

      const errorMessage =
        error.serverError || "Failed to register. Please try again.";

      toast.error(errorMessage);
    },
  });

  // จัดการ error จาก result.data
  useEffect(() => {
    if (
      result.data &&
      "success" in result.data &&
      !result.data.success &&
      "error" in result.data
    ) {
      toast.error(result.data.error as string);
    }
  }, [result]);

  // ...
}
```

## Error Flow

### กรณีที่ 1: Exception/Validation Error

```
Action throws error
  ↓
onError callback
  ↓
toast.error(error.serverError)
```

### กรณีที่ 2: Return Error Object

```
Action returns { success: false, error: "..." }
  ↓
result.data updated
  ↓
useEffect detects change
  ↓
toast.error(result.data.error)
```

## ตัวอย่าง Error Messages

### Invalid Credentials

```typescript
// Server Action
return { success: false, error: "Invalid login credentials" };

// Client
toast.error("Invalid login credentials"); // ✅ แสดง
```

### Email Already Exists

```typescript
// Server Action
return { success: false, error: "User already registered" };

// Client
toast.error("User already registered"); // ✅ แสดง
```

### Network Error

```typescript
// Server Action throws
throw new Error("Network error");

// Client (onError)
toast.error("Network error"); // ✅ แสดง
```

### Validation Error

```typescript
// Zod validation fails
email: "Invalid email format";

// Client (onError)
toast.error("Invalid email format"); // ✅ แสดง
```

## Best Practices

### 1. Consistent Error Response

Server actions ควร return consistent format:

```typescript
// ✅ Good
return { success: false, error: "User-friendly message" };

// ❌ Bad
throw new Error("Technical error message");
```

### 2. User-Friendly Messages

```typescript
// ✅ Good
"Invalid email or password";
"This email is already registered";
"Please check your internet connection";

// ❌ Bad
"SQLSTATE[23000]: Integrity constraint violation";
"Error: Cannot read property 'id' of undefined";
```

### 3. Error Logging

```typescript
// Log technical details
console.error("❌ Login error:", error);

// Show user-friendly message
toast.error("Invalid email or password");
```

### 4. Fallback Messages

```typescript
const errorMessage =
  error.serverError || "Something went wrong. Please try again.";
```

## Testing

### Test Invalid Credentials

1. ไปที่หน้า login
2. กรอก email/password ผิด
3. กด Sign in
4. ควรเห็น toast error: "Invalid login credentials"

### Test Email Already Exists

1. ไปที่หน้า register
2. กรอก email ที่มีอยู่แล้ว
3. กด Create account
4. ควรเห็น toast error: "User already registered"

### Test Network Error

1. ปิด internet
2. พยายาม login
3. ควรเห็น toast error

### Test Validation Error

1. กรอก email format ผิด
2. ควรเห็น toast error: "Invalid email"

## Common Supabase Errors

### Authentication Errors

```typescript
// Invalid credentials
"Invalid login credentials";

// Email not confirmed
"Email not confirmed";

// User not found
"User not found";

// Too many requests
"Too many requests";
```

### Database Errors

```typescript
// Unique constraint
"duplicate key value violates unique constraint"
→ แปลเป็น: "This email is already registered"

// Foreign key constraint
"violates foreign key constraint"
→ แปลเป็น: "Invalid reference"
```

## Error Translation

แปลง technical errors เป็น user-friendly:

```typescript
function getErrorMessage(error: string): string {
  const errorMap: Record<string, string> = {
    "Invalid login credentials": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "Email not confirmed": "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
    "User already registered": "อีเมลนี้ถูกใช้งานแล้ว",
    "Too many requests": "พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่",
  };

  return errorMap[error] || error;
}

// ใช้งาน
toast.error(getErrorMessage(result.data.error));
```

## Migration Checklist

- [x] เพิ่ม useEffect ใน login form
- [x] เพิ่ม useEffect ใน register form
- [x] เพิ่ม result จาก useAction
- [x] จัดการ error ทั้ง onError และ result.data
- [x] Test กับ invalid credentials
- [x] Test กับ network errors
- [x] สร้าง documentation

## Next Steps

1. **Test ทุก error cases** - ตรวจสอบว่า toast แสดงทุกกรณี
2. **Add error translation** - แปลเป็นภาษาไทยถ้าต้องการ
3. **Improve error messages** - ทำให้ user-friendly มากขึ้น
4. **Add error tracking** - ส่ง errors ไปที่ Sentry หรือ logging service
