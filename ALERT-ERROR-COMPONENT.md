# Alert Error Component - แสดง Error ข้างบนปุ่ม

## การเพิ่ม Alert Component

เพิ่ม Alert component แสดง error message ข้างบนปุ่ม Submit พร้อมกับ toast notification

## ตัวอย่าง UI

```
┌─────────────────────────────────┐
│ Email                           │
│ [email input field]             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Password                        │
│ [password input field]          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ⚠️ Invalid login credentials    │  ← Alert Error
└─────────────────────────────────┘

┌─────────────────────────────────┐
│         [Sign in Button]        │
└─────────────────────────────────┘
```

## Implementation

### 1. Login Form

**File:** `apps/web/components/auth/login-form.tsx`

```typescript
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { AlertCircle } from "lucide-react";
import { useMemo, useEffect } from "react";

export function LoginForm() {
  const { execute, isExecuting, result } = useAction(loginAction, {
    onSuccess: ({ data }) => {
      console.log("✅ Login action success:", data);
    },
    onError: ({ error }) => {
      console.error("❌ Login action error:", error);
      const errorMsg = error.serverError || "Failed to login. Please try again.";
      toast.error(errorMsg);
    },
  });

  // ดึง error message จาก result
  const errorMessage = useMemo(() => {
    if (
      result.data &&
      "success" in result.data &&
      !result.data.success &&
      "error" in result.data
    ) {
      return result.data.error as string;
    }
    return null;
  }, [result]);

  // แสดง toast เมื่อมี error
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [errorMessage]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email field */}
      {/* Password field */}

      {/* Error Alert */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isExecuting}>
        {isExecuting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
```

### 2. Register Form

**File:** `apps/web/components/auth/register-form.tsx`

```typescript
// Same pattern as login form
{errorMessage && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{errorMessage}</AlertDescription>
  </Alert>
)}
```

## Features

### 1. Dual Error Display

- **Alert Component** - แสดงข้างบนปุ่ม (persistent)
- **Toast Notification** - แสดงมุมจอ (temporary)

### 2. Error Sources

จัดการ error จาก 2 ช่องทาง:

- `onError` callback - Exception/Validation errors
- `result.data` - Return error objects

### 3. Auto Clear

- Error จะถูก clear เมื่อ submit form ใหม่
- Error จะถูก clear เมื่อ login สำเร็จ

### 4. User-Friendly

- Icon แสดงความหมาย (AlertCircle)
- สี destructive (red) เตือนความผิดพลาด
- Message ชัดเจนและเข้าใจง่าย

## Alert Component Props

### variant

```typescript
variant?: "default" | "destructive"
```

- `default` - สีปกติ
- `destructive` - สีแดง (สำหรับ error)

### Example

```typescript
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>
    Invalid login credentials
  </AlertDescription>
</Alert>
```

## Error Flow

### Invalid Credentials

```
User submits form
  ↓
Server returns { success: false, error: "Invalid login credentials" }
  ↓
useMemo detects error in result.data
  ↓
errorMessage = "Invalid login credentials"
  ↓
Alert component shows (persistent)
  ↓
useEffect triggers toast (temporary)
```

### Network Error

```
User submits form
  ↓
Network request fails
  ↓
onError callback triggered
  ↓
Toast shows immediately
  ↓
(No Alert because no result.data)
```

## Styling

### Alert Component

```typescript
// From @workspace/ui/components/alert
<Alert variant="destructive">
  // Red background
  // Red border
  // Red text
</Alert>
```

### Icon

```typescript
<AlertCircle className="h-4 w-4" />
// Small icon
// Matches alert color
```

### Description

```typescript
<AlertDescription>
  // Error message text
  // Readable font size
</AlertDescription>
```

## Best Practices

### 1. Clear Error Messages

```typescript
// ✅ Good
"Invalid email or password";
"This email is already registered";

// ❌ Bad
"Error 401";
"Authentication failed";
```

### 2. Consistent Placement

```typescript
// Always place Alert above Submit button
<form>
  {/* Form fields */}

  {errorMessage && <Alert>...</Alert>}

  <Button type="submit">Submit</Button>
</form>
```

### 3. Auto Clear

```typescript
const onSubmit = (data) => {
  // Error will auto-clear on next submit
  execute(data);
};
```

### 4. Accessibility

```typescript
// Alert has proper ARIA attributes
// Icon has semantic meaning
// Error message is readable
```

## Testing

### Test Error Display

1. ไปที่หน้า login
2. กรอก email/password ผิด
3. กด Sign in
4. ควรเห็น:
   - ✅ Alert component สีแดงข้างบนปุ่ม
   - ✅ Toast notification มุมจอ
   - ✅ Error message: "Invalid login credentials"

### Test Error Clear

1. เห็น error alert
2. แก้ไข email/password
3. กด Sign in อีกครั้ง
4. ควรเห็น:
   - ✅ Alert หายไป
   - ✅ Loading state แสดง

### Test Multiple Errors

1. Submit ด้วย email ผิด
2. เห็น error alert
3. Submit ด้วย password ผิด
4. ควรเห็น:
   - ✅ Alert อัพเดทเป็น error ใหม่
   - ✅ Toast แสดง error ใหม่

## Comparison

### Before (Toast Only)

```
❌ Error หายไปเร็ว
❌ User อาจพลาดข้อความ
❌ ไม่มี visual feedback ถาวร
```

### After (Alert + Toast)

```
✅ Alert แสดงถาวรจนกว่าจะแก้ไข
✅ Toast แจ้งเตือนทันที
✅ Visual feedback ชัดเจน
✅ User experience ดีขึ้น
```

## Error Types

### Authentication Errors

```typescript
"Invalid login credentials";
"Email not confirmed";
"Account locked";
```

### Validation Errors

```typescript
"Invalid email format";
"Password too short";
"Passwords do not match";
```

### Network Errors

```typescript
"Network error. Please try again.";
"Server is not responding";
"Connection timeout";
```

### Database Errors

```typescript
"This email is already registered";
"User not found";
"Account already exists";
```

## Customization

### Change Alert Style

```typescript
// Different variant
<Alert variant="default">
  <AlertDescription>Info message</AlertDescription>
</Alert>

// Custom className
<Alert variant="destructive" className="my-custom-class">
  <AlertDescription>Error message</AlertDescription>
</Alert>
```

### Change Icon

```typescript
// Different icon
import { XCircle } from "lucide-react";

<Alert variant="destructive">
  <XCircle className="h-4 w-4" />
  <AlertDescription>Error message</AlertDescription>
</Alert>
```

### Add Title

```typescript
import { AlertTitle } from "@workspace/ui/components/alert";

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Invalid credentials</AlertDescription>
</Alert>
```

## Migration Checklist

- [x] เพิ่ม Alert component import
- [x] เพิ่ม AlertCircle icon
- [x] เพิ่ม useMemo สำหรับ errorMessage
- [x] เพิ่ม Alert component ใน form
- [x] วาง Alert ข้างบนปุ่ม Submit
- [x] Test กับ invalid credentials
- [x] Test error clear behavior
- [x] สร้าง documentation

## Next Steps

1. **Test ทุก error cases** - ตรวจสอบว่า Alert แสดงถูกต้อง
2. **Add success alert** - แสดง success message ด้วย Alert
3. **Improve styling** - ปรับแต่ง UI ให้สวยงาม
4. **Add animation** - เพิ่ม fade in/out animation
