---
feature: Modern Web Application Foundation
status: draft
created: 2026-02-09
---

# Requirements: Modern Web Application Foundation

## Overview

สร้างระบบพื้นฐานสำหรับ web application ที่ทันสมัย ประกอบด้วย authentication, dashboard, profile management และ theme switching พร้อมฟีเจอร์เสริมที่จำเป็น

## User Stories

### 1. Authentication System

**As a user**, I want to:

- ลงทะเบียนบัญชีใหม่ด้วย email และ password
- เข้าสู่ระบบด้วย email และ password
- ออกจากระบบได้อย่างปลอดภัย
- รีเซ็ตรหัสผ่านเมื่อลืม
- เห็น loading state ขณะทำการ authentication
- เห็น error messages ที่ชัดเจนเมื่อมีปัญหา

**Acceptance Criteria:**

- ✓ Form validation ทำงานก่อน submit
- ✓ Password ต้องมีความยาวอย่างน้อย 8 ตัวอักษร
- ✓ Email ต้องเป็นรูปแบบที่ถูกต้อง
- ✓ แสดง loading indicator ขณะ processing
- ✓ Session จะถูกเก็บไว้หลัง refresh page
- ✓ Protected routes จะ redirect ไป login หากยังไม่ได้ login

### 2. Dashboard Page

**As a logged-in user**, I want to:

- เห็นหน้า dashboard หลังจาก login สำเร็จ
- เห็นข้อมูลสรุปที่สำคัญ (stats cards)
- เข้าถึงเมนูหลักได้ง่าย
- เห็น welcome message พร้อมชื่อของฉัน

**Acceptance Criteria:**

- ✓ Dashboard แสดงเฉพาะเมื่อ authenticated
- ✓ มี navigation bar/sidebar ที่ใช้งานง่าย
- ✓ แสดง stats cards อย่างน้อย 3-4 cards
- ✓ Responsive design ทำงานบนทุก screen size
- ✓ Loading skeleton แสดงขณะโหลดข้อมูล

### 3. Profile Management

**As a user**, I want to:

- ดูข้อมูล profile ของฉัน
- แก้ไขข้อมูลส่วนตัว (ชื่อ, email, bio)
- อัพโหลดรูป avatar
- เปลี่ยนรหัสผ่าน
- เห็นการยืนยันเมื่อบันทึกสำเร็จ

**Acceptance Criteria:**

- ✓ Form มี validation ที่เหมาะสม
- ✓ แสดง preview ของรูป avatar ก่อนอัพโหลด
- ✓ แสดง success/error toast notifications
- ✓ ข้อมูลที่แก้ไขจะ persist หลัง refresh
- ✓ มีปุ่ม cancel เพื่อยกเลิกการแก้ไข

### 4. Dark Mode Toggle

**As a user**, I want to:

- สลับระหว่าง light และ dark theme
- Theme preference จะถูกบันทึกไว้
- เห็น smooth transition เมื่อสลับ theme
- Theme จะถูกนำมาใช้ทั่วทั้งแอป

**Acceptance Criteria:**

- ✓ Toggle button เข้าถึงได้ง่ายจากทุกหน้า
- ✓ Theme preference บันทึกใน localStorage
- ✓ ใช้ system preference เป็น default
- ✓ Smooth transition animation
- ✓ ทุก component รองรับทั้ง light และ dark mode

## Additional Features (เสริม)

### 5. Toast Notifications System

**Purpose:** แสดง feedback ให้ user สำหรับ actions ต่างๆ

**Features:**

- Success, error, warning, info variants
- Auto-dismiss หลังจาก 3-5 วินาที
- สามารถ dismiss manually
- Stack multiple notifications
- Accessible (screen reader support)

### 6. Loading States & Skeletons

**Purpose:** ปรับปรุง UX ขณะรอโหลดข้อมูล

**Features:**

- Skeleton screens สำหรับ dashboard
- Loading spinners สำหรับ buttons
- Progress indicators สำหรับ file uploads
- Suspense boundaries สำหรับ lazy-loaded components

### 7. Error Handling & Boundaries

**Purpose:** จัดการ errors อย่างเหมาะสม

**Features:**

- Error boundary components
- 404 page สำหรับ routes ที่ไม่มี
- 500 page สำหรับ server errors
- Retry mechanisms สำหรับ failed requests
- User-friendly error messages

### 8. Form Validation & Management

**Purpose:** จัดการ forms อย่างมีประสิทธิภาพ

**Features:**

- Real-time validation
- Field-level error messages
- Dirty state tracking
- Form reset functionality
- Accessible form labels และ errors

### 9. Responsive Navigation

**Purpose:** Navigation ที่ทำงานดีบนทุก device

**Features:**

- Desktop: Sidebar navigation
- Mobile: Hamburger menu
- Active route highlighting
- Breadcrumbs สำหรับ nested routes
- User menu dropdown

### 10. Settings Page

**Purpose:** จัดการ preferences และ configurations

**Features:**

- Account settings
- Notification preferences
- Privacy settings
- Language selection (optional)
- Delete account option

## Technical Requirements

### Frontend Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** React Context / Zustand
- **Forms:** React Hook Form + Zod validation
- **Auth Client:** @supabase/ssr (for Next.js App Router)
- **Database Client:** @supabase/supabase-js
- **Theme:** next-themes

### Backend Stack

- **Database:** PostgreSQL (Supabase hosted)
- **ORM:** Drizzle ORM
  - `drizzle-orm` - Core ORM library
  - `drizzle-kit` - Migration tool
  - `postgres` - PostgreSQL driver
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage (for avatar uploads)

### UI Components (from shadcn/ui)

- Button, Input, Label, Textarea
- Card, Avatar, Badge
- Dialog, Sheet (for mobile menu)
- Toast, Alert
- Dropdown Menu, Select
- Tabs, Separator
- Skeleton, Spinner

### Authentication Strategy

- **Primary:** Supabase Auth
  - Email/Password authentication
  - Session management via Supabase client
  - Server-side auth helpers for Next.js
  - Automatic token refresh
  - Built-in security features

### Database & ORM

- **Database:** PostgreSQL (via Supabase)
- **ORM:** Drizzle ORM
  - Type-safe database queries
  - Schema migrations
  - Relations support
  - Connection pooling

### Data Persistence

- **User Session:** Supabase Auth (cookies + localStorage)
- **Theme Preference:** localStorage
- **Form Drafts:** localStorage (optional)
- **User Data:** PostgreSQL via Drizzle ORM

### API Structure

**Note:** เนื่องจากใช้ Supabase Auth, การ authentication จะทำผ่าน Supabase client โดยตรง ไม่ต้องสร้าง API routes สำหรับ auth

**Custom API Routes:**

```
/api/user/profile          - GET, PATCH (อัพเดทข้อมูล profile)
/api/user/avatar           - POST (อัพโหลด avatar ไป Supabase Storage)
/api/user/settings         - GET, PATCH (จัดการ user settings)
```

**Supabase Auth Methods (Client-side):**

```typescript
// Registration
supabase.auth.signUp({ email, password });

// Login
supabase.auth.signInWithPassword({ email, password });

// Logout
supabase.auth.signOut();

// Reset Password
supabase.auth.resetPasswordForEmail(email);

// Get Session
supabase.auth.getSession();

// Get User
supabase.auth.getUser();
```

### Database Schema (Drizzle)

**Users Table (Extended Profile):**

```typescript
// Supabase มี auth.users table อยู่แล้ว
// เราจะสร้าง public.profiles table เพื่อเก็บข้อมูลเพิ่มเติม

export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .references(() => auth.users.id),
  fullName: text("full_name"),
  username: text("username").unique(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => profiles.id)
    .notNull(),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  theme: text("theme").default("system"), // 'light' | 'dark' | 'system'
  language: text("language").default("th"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

## Design Considerations

### Color Scheme

- Primary color: Blue (#3B82F6)
- Success: Green (#10B981)
- Error: Red (#EF4444)
- Warning: Yellow (#F59E0B)
- Neutral: Gray scale

### Typography

- Font: Inter / Geist Sans
- Headings: Bold, larger sizes
- Body: Regular, readable line-height

### Spacing & Layout

- Consistent padding/margin scale (4px base)
- Max content width: 1280px
- Sidebar width: 256px (desktop)

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly
- Focus indicators
- Sufficient color contrast

## Security Considerations

### Supabase Auth Security

- Row Level Security (RLS) policies บน PostgreSQL
- Automatic password hashing (bcrypt)
- JWT-based session management
- Automatic token refresh
- PKCE flow สำหรับ OAuth (future)

### Application Security

- CSRF protection (Next.js built-in)
- XSS prevention (React built-in escaping)
- Rate limiting สำหรับ API routes
- Input sanitization และ validation (Zod)
- Secure file upload validation (type, size)
- Environment variables สำหรับ secrets

### Database Security (RLS Policies)

```sql
-- Profiles table: Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Settings table: Users can only access their own settings
CREATE POLICY "Users can manage own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id);
```

## Performance Goals

- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Lighthouse score > 90
- Optimized images (next/image)
- Code splitting & lazy loading

## Out of Scope (Phase 1)

- Email verification (Supabase รองรับ แต่ไม่ implement ใน phase 1)
- Two-factor authentication
- Social login (Google, Facebook) - Supabase รองรับ แต่ไม่ implement ใน phase 1
- Advanced analytics
- Real-time notifications (Supabase Realtime)
- Multi-language support (i18n)
- Magic link authentication

## Dependencies & Setup

### Required Packages

```json
{
  "dependencies": {
    "@supabase/ssr": "^0.1.0",
    "@supabase/supabase-js": "^2.39.0",
    "drizzle-orm": "^0.29.0",
    "postgres": "^3.4.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "next-themes": "^0.2.1",
    "sonner": "^1.3.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.0"
  }
}
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (for Drizzle)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

### Supabase Project Setup

1. สร้าง project ใหม่บน Supabase
2. Enable Email Auth ใน Authentication settings
3. สร้าง Storage bucket สำหรับ avatars
4. ตั้งค่า RLS policies
5. Run Drizzle migrations

### Drizzle Configuration

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

## Success Metrics

- User can complete registration in < 2 minutes
- Login success rate > 95%
- Profile update success rate > 98%
- Zero critical accessibility issues
- Mobile usability score > 90

## Next Steps

1. ✅ Review และ approve requirements
2. สร้าง detailed design document
   - Component architecture
   - File structure
   - Supabase client setup
   - Drizzle schema definitions
   - Auth middleware implementation
3. Break down เป็น implementation tasks
4. Setup Supabase project และ environment
5. เริ่ม development phase

## Additional Technical Details

### Supabase Client Setup (Next.js App Router)

**Server Component:**

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );
};
```

**Client Component:**

```typescript
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
};
```

### Middleware for Auth

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(...)

  const { data: { session } } = await supabase.auth.getSession()

  // Protect routes
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}
```
