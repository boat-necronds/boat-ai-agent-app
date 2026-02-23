# Components Directory

โครงสร้าง Components ที่จัดระเบียบตามหน้าที่และ domain

## โครงสร้าง

```
components/
├── layout/              # Layout components (Sidebar, Navigation)
│   ├── app-sidebar.tsx
│   ├── nav-main.tsx
│   ├── nav-user.tsx
│   └── index.ts
├── dashboard/           # Dashboard page sections
│   ├── header.tsx
│   ├── stats.tsx
│   ├── content.tsx
│   ├── overview.tsx
│   ├── recent-activity.tsx
│   └── index.ts
├── auth/                # Authentication components
│   ├── login-form.tsx
│   └── register-form.tsx
├── providers.tsx        # App providers
└── README.md
```

## หลักการจัดระเบียบ

### 1. Layout Components (`components/layout/`)

Components ที่เกี่ยวกับ layout และ navigation:

- `app-sidebar.tsx` - Main sidebar component
- `nav-main.tsx` - Main navigation menu
- `nav-user.tsx` - User dropdown menu

**ใช้เมื่อ:**

- เป็น global layout components
- ใช้ในหลายๆ pages
- เกี่ยวกับ navigation structure

### 2. Page Sections (`components/{page}/`)

แต่ละ page มี folder ของตัวเอง แยก sections ออกเป็นไฟล์:

**Dashboard Example:**

```
dashboard/
├── header.tsx          # Page header with title
├── stats.tsx           # Statistics cards
├── content.tsx         # Main content area
├── overview.tsx        # Overview chart section
├── recent-activity.tsx # Activity list section
└── index.ts            # Export all sections
```

**ข้อดี:**

- แยก concerns ชัดเจน
- ง่ายต่อการ maintain
- Reusable sections
- Test แยกได้

### 3. Feature Components (`components/{feature}/`)

Components ที่เกี่ยวกับ feature เฉพาะ:

- `auth/` - Authentication forms
- `profile/` - Profile management (future)
- `settings/` - Settings forms (future)

## Naming Convention

### Component Files

- Format: `{name}.tsx` (kebab-case)
- ตัวอย่าง: `app-sidebar.tsx`, `nav-main.tsx`, `recent-activity.tsx`

### Component Names

- Format: `PascalCase`
- ตัวอย่าง: `AppSidebar`, `NavMain`, `RecentActivity`

### Section Components

- Prefix ด้วยชื่อ page: `Dashboard{Section}`
- ตัวอย่าง: `DashboardHeader`, `DashboardStats`, `DashboardContent`

### Index Files

- แต่ละ folder มี `index.ts`
- Re-export ทุก components

```typescript
// components/dashboard/index.ts
export * from "./header";
export * from "./stats";
export * from "./content";
```

## การใช้งาน

### Import Layout Components

```typescript
import { AppSidebar, NavMain, NavUser } from "@/components/layout";
```

### Import Page Sections

```typescript
import {
  DashboardHeader,
  DashboardStats,
  DashboardContent,
} from "@/components/dashboard";
```

### Import Feature Components

```typescript
import { LoginForm, RegisterForm } from "@/components/auth";
```

## ตัวอย่าง: Dashboard Page

### Before (Monolithic)

```typescript
// app/(dashboard)/dashboard/page.tsx
export default async function DashboardPage() {
  // 200+ lines of code
  // Stats, charts, activities all in one file
  return (
    <div>
      {/* All JSX here */}
    </div>
  );
}
```

### After (Sections)

```typescript
// app/(dashboard)/dashboard/page.tsx
import {
  DashboardHeader,
  DashboardStats,
  DashboardContent
} from "@/components/dashboard";

export default async function DashboardPage() {
  const account = await getAccount(user.id);

  return (
    <div className="space-y-6">
      <DashboardHeader userName={account?.fullName} userEmail={user?.email} />
      <DashboardStats />
      <DashboardContent />
    </div>
  );
}
```

**ข้อดี:**

- Page file สั้นและชัดเจน
- แต่ละ section แยกไฟล์
- ง่ายต่อการ maintain
- Test แยกได้

## เพิ่ม Page Sections ใหม่

### 1. สร้าง Folder

```bash
mkdir components/profile
```

### 2. สร้าง Section Components

```typescript
// components/profile/header.tsx
interface ProfileHeaderProps {
  userName?: string | null;
}

export function ProfileHeader({ userName }: ProfileHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="text-muted-foreground">{userName}</p>
    </div>
  );
}
```

```typescript
// components/profile/info-card.tsx
export function ProfileInfoCard({ account }) {
  return (
    <Card>
      {/* Profile info */}
    </Card>
  );
}
```

```typescript
// components/profile/edit-form.tsx
export function ProfileEditForm({ account }) {
  return (
    <form>
      {/* Edit form */}
    </form>
  );
}
```

### 3. Export

```typescript
// components/profile/index.ts
export * from "./header";
export * from "./info-card";
export * from "./edit-form";
```

### 4. ใช้ใน Page

```typescript
// app/(dashboard)/profile/page.tsx
import {
  ProfileHeader,
  ProfileInfoCard,
  ProfileEditForm
} from "@/components/profile";

export default async function ProfilePage() {
  const account = await getAccount(user.id);

  return (
    <div className="space-y-6">
      <ProfileHeader userName={account?.fullName} />
      <ProfileInfoCard account={account} />
      <ProfileEditForm account={account} />
    </div>
  );
}
```

## Best Practices

### 1. Single Responsibility

แต่ละ component ทำหน้าที่เดียว:

```typescript
// ✅ Good - Single responsibility
export function DashboardStats() {
  return <div>{/* Only stats */}</div>;
}

// ❌ Bad - Multiple responsibilities
export function DashboardStatsAndChart() {
  return <div>{/* Stats + Chart */}</div>;
}
```

### 2. Props Interface

กำหนด interface ชัดเจน:

```typescript
interface DashboardHeaderProps {
  userName?: string | null;
  userEmail?: string;
}

export function DashboardHeader({ userName, userEmail }: DashboardHeaderProps) {
  // ...
}
```

### 3. Client vs Server Components

- Default: Server Components
- ใช้ `"use client"` เมื่อจำเป็น (hooks, events)

```typescript
// Server Component (default)
export function DashboardStats() {
  return <div>Stats</div>;
}

// Client Component (needs interactivity)
"use client";
export function DashboardChart() {
  const [data, setData] = useState([]);
  return <Chart data={data} />;
}
```

### 4. Composition

ใช้ composition pattern:

```typescript
// components/dashboard/content.tsx
import { DashboardOverview } from "./overview";
import { RecentActivity } from "./recent-activity";

export function DashboardContent() {
  return (
    <div className="grid gap-4 md:grid-cols-7">
      <DashboardOverview />
      <RecentActivity />
    </div>
  );
}
```

### 5. Reusability

สร้าง components ที่ reusable:

```typescript
// ✅ Good - Reusable
interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  return <Card>{/* ... */}</Card>;
}

// ❌ Bad - Hardcoded
export function UserStatCard() {
  return <Card>Total Users: 1234</Card>;
}
```

## Component Types

### Layout Components

- Global layout elements
- Navigation, Sidebar, Header, Footer
- ใช้ในหลาย pages

### Section Components

- ส่วนหนึ่งของ page
- แยกตาม visual sections
- Specific to one page

### Feature Components

- เกี่ยวกับ feature เฉพาะ
- Forms, Modals, Dialogs
- อาจใช้ในหลาย pages

### UI Components

- อยู่ใน `packages/ui`
- Generic, reusable
- ไม่มี business logic

## Testing

### Unit Tests

```typescript
// components/dashboard/__tests__/stats.test.tsx
import { render } from "@testing-library/react";
import { DashboardStats } from "../stats";

describe("DashboardStats", () => {
  it("renders stats correctly", () => {
    const { getByText } = render(<DashboardStats />);
    expect(getByText("Total Users")).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// __tests__/dashboard.test.tsx
import { render } from "@testing-library/react";
import DashboardPage from "@/app/(dashboard)/dashboard/page";

describe("Dashboard Page", () => {
  it("renders all sections", () => {
    // Test implementation
  });
});
```

## Migration Checklist

- [x] สร้าง `components/layout/` folder
- [x] ย้าย sidebar components ไปที่ layout
- [x] สร้าง `components/dashboard/` sections
- [x] แยก dashboard page เป็น sections
- [x] อัพเดท imports ใน layout
- [x] ลบ components เดิม
- [x] สร้าง index.ts files
- [x] สร้าง README.md

## ตัวอย่าง Folders ที่อาจเพิ่มในอนาคต

```
components/
├── layout/         # ✅ มีแล้ว
├── dashboard/      # ✅ มีแล้ว
├── auth/           # ✅ มีแล้ว
├── profile/        # Profile page sections
├── settings/       # Settings page sections
├── posts/          # Blog posts components
├── comments/       # Comment components
├── notifications/  # Notification components
└── shared/         # Shared components across features
```
