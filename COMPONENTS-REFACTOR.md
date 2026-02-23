# Components Refactor - แยก Layout และ Sections

## สรุปการเปลี่ยนแปลง

1. แยก sidebar components ไปอยู่ใน `components/layout/`
2. แยก dashboard page เป็น sections ใน `components/dashboard/`

## โครงสร้างเดิม

```
components/
└── dashboard/
    ├── app-sidebar.tsx    # Sidebar component
    ├── nav-main.tsx       # Navigation
    ├── nav-user.tsx       # User menu
    └── sidebar.tsx        # Duplicate sidebar

app/(dashboard)/dashboard/
└── page.tsx              # 100+ lines monolithic file
```

## โครงสร้างใหม่

```
components/
├── layout/                    # Layout components
│   ├── app-sidebar.tsx
│   ├── nav-main.tsx
│   ├── nav-user.tsx
│   └── index.ts
├── dashboard/                 # Dashboard sections
│   ├── header.tsx            # Page header
│   ├── stats.tsx             # Statistics cards
│   ├── content.tsx           # Main content wrapper
│   ├── overview.tsx          # Overview chart
│   ├── recent-activity.tsx   # Activity list
│   └── index.ts
└── auth/
    ├── login-form.tsx
    └── register-form.tsx

app/(dashboard)/dashboard/
└── page.tsx                  # Clean, 15 lines
```

## ข้อดี

### 1. แยก Layout Components

**Before:**

```
components/dashboard/
├── app-sidebar.tsx    # Layout component
├── nav-main.tsx       # Layout component
├── nav-user.tsx       # Layout component
```

**After:**

```
components/layout/     # ชัดเจนว่าเป็น layout
├── app-sidebar.tsx
├── nav-main.tsx
├── nav-user.tsx
```

**ทำไม?**

- Sidebar ไม่ใช่ส่วนหนึ่งของ dashboard page
- เป็น global layout component
- ใช้ในทุก pages ภายใน dashboard layout

### 2. แยก Page เป็น Sections

**Before:**

```typescript
// page.tsx - 100+ lines
export default async function DashboardPage() {
  // Data fetching
  const stats = [...];

  return (
    <div>
      {/* Header */}
      <div>
        <h1>Dashboard</h1>
        <p>Welcome back...</p>
      </div>

      {/* Stats - 30 lines */}
      <div className="grid">
        {stats.map(stat => (
          <Card>...</Card>
        ))}
      </div>

      {/* Content - 50 lines */}
      <div className="grid">
        <Card>Overview...</Card>
        <Card>Activity...</Card>
      </div>
    </div>
  );
}
```

**After:**

```typescript
// page.tsx - 15 lines
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

**ทำไม?**

- Page file สั้นและอ่านง่าย
- แต่ละ section มีหน้าที่ชัดเจน
- ง่ายต่อการ maintain และ test
- Reusable sections

### 3. Single Responsibility

แต่ละ component ทำหน้าที่เดียว:

```typescript
// components/dashboard/header.tsx
export function DashboardHeader({ userName, userEmail }) {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome back, {userName || userEmail}! 👋</p>
    </div>
  );
}

// components/dashboard/stats.tsx
export function DashboardStats() {
  const stats = [...];
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
    </div>
  );
}

// components/dashboard/content.tsx
export function DashboardContent() {
  return (
    <div className="grid gap-4 md:grid-cols-7">
      <DashboardOverview />
      <RecentActivity />
    </div>
  );
}
```

## การเปลี่ยนแปลง Import

### Layout Components

**Before:**

```typescript
import { AppSidebar } from "@/components/dashboard/app-sidebar";
```

**After:**

```typescript
import { AppSidebar } from "@/components/layout";
```

### Dashboard Sections

**Before:**

```typescript
// All in page.tsx
```

**After:**

```typescript
import {
  DashboardHeader,
  DashboardStats,
  DashboardContent,
} from "@/components/dashboard";
```

## ไฟล์ที่เปลี่ยนแปลง

### ย้ายไปที่ Layout

- `components/dashboard/app-sidebar.tsx` → `components/layout/app-sidebar.tsx`
- `components/dashboard/nav-main.tsx` → `components/layout/nav-main.tsx`
- `components/dashboard/nav-user.tsx` → `components/layout/nav-user.tsx`

### สร้างใหม่ (Dashboard Sections)

- `components/dashboard/header.tsx`
- `components/dashboard/stats.tsx`
- `components/dashboard/content.tsx`
- `components/dashboard/overview.tsx`
- `components/dashboard/recent-activity.tsx`
- `components/dashboard/index.ts`

### สร้างใหม่ (Layout)

- `components/layout/index.ts`

### อัพเดท

- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/layout.tsx`

### ลบ

- `components/dashboard/sidebar.tsx` (duplicate)

## Section Components Pattern

### 1. Header Section

```typescript
// components/dashboard/header.tsx
interface DashboardHeaderProps {
  userName?: string | null;
  userEmail?: string;
}

export function DashboardHeader({ userName, userEmail }: DashboardHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Welcome back, {userName || userEmail}! 👋
      </p>
    </div>
  );
}
```

### 2. Stats Section

```typescript
// components/dashboard/stats.tsx
export function DashboardStats() {
  const stats = [
    { title: "Total Users", value: "1,234", icon: Users },
    // ...
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
    </div>
  );
}
```

### 3. Content Section (Composition)

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

## Best Practices

### 1. Naming Convention

- Layout components: `{Name}` (e.g., `AppSidebar`, `NavMain`)
- Section components: `{Page}{Section}` (e.g., `DashboardHeader`, `DashboardStats`)
- Files: kebab-case (e.g., `app-sidebar.tsx`, `recent-activity.tsx`)

### 2. Props Interface

```typescript
// ✅ Good - Clear interface
interface DashboardHeaderProps {
  userName?: string | null;
  userEmail?: string;
}

export function DashboardHeader({ userName, userEmail }: DashboardHeaderProps) {
  // ...
}

// ❌ Bad - No interface
export function DashboardHeader({ userName, userEmail }) {
  // ...
}
```

### 3. Composition

```typescript
// ✅ Good - Compose smaller components
export function DashboardContent() {
  return (
    <div>
      <DashboardOverview />
      <RecentActivity />
    </div>
  );
}

// ❌ Bad - Everything in one component
export function DashboardContent() {
  return (
    <div>
      {/* 100 lines of JSX */}
    </div>
  );
}
```

### 4. Server vs Client Components

```typescript
// Server Component (default) - No "use client"
export function DashboardStats() {
  return <div>Stats</div>;
}

// Client Component - Needs "use client"
"use client";
export function DashboardChart() {
  const [data, setData] = useState([]);
  return <Chart data={data} />;
}
```

## Testing Benefits

### Before

```typescript
// Hard to test - everything in one file
describe("Dashboard Page", () => {
  it("renders everything", () => {
    // Test 100+ lines of code
  });
});
```

### After

```typescript
// Easy to test - isolated sections
describe("DashboardHeader", () => {
  it("displays user name", () => {
    render(<DashboardHeader userName="John" />);
    expect(screen.getByText(/John/)).toBeInTheDocument();
  });
});

describe("DashboardStats", () => {
  it("renders all stat cards", () => {
    render(<DashboardStats />);
    expect(screen.getAllByRole("article")).toHaveLength(4);
  });
});
```

## เพิ่ม Page Sections ใหม่

### ตัวอย่าง: Profile Page

```typescript
// 1. สร้าง sections
// components/profile/header.tsx
export function ProfileHeader({ userName }) {
  return <div><h1>Profile</h1></div>;
}

// components/profile/info-card.tsx
export function ProfileInfoCard({ account }) {
  return <Card>{/* Info */}</Card>;
}

// components/profile/edit-form.tsx
export function ProfileEditForm({ account }) {
  return <form>{/* Form */}</form>;
}

// 2. Export
// components/profile/index.ts
export * from "./header";
export * from "./info-card";
export * from "./edit-form";

// 3. ใช้ใน page
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

## Migration Checklist

- [x] สร้าง `components/layout/` folder
- [x] ย้าย sidebar components ไปที่ layout
- [x] สร้าง `components/dashboard/` sections
- [x] แยก dashboard page เป็น sections (header, stats, content)
- [x] สร้าง sub-sections (overview, recent-activity)
- [x] อัพเดท imports ใน layout
- [x] อัพเดท dashboard page ให้ใช้ sections
- [x] ลบ components เดิม
- [x] สร้าง index.ts files
- [x] สร้าง README.md

## ตัวอย่าง Folders ในอนาคต

```
components/
├── layout/         # ✅ Global layout components
├── dashboard/      # ✅ Dashboard page sections
├── auth/           # ✅ Auth forms
├── profile/        # Profile page sections
│   ├── header.tsx
│   ├── info-card.tsx
│   ├── edit-form.tsx
│   └── index.ts
├── settings/       # Settings page sections
│   ├── header.tsx
│   ├── notifications.tsx
│   ├── appearance.tsx
│   └── index.ts
└── shared/         # Shared components
    ├── stat-card.tsx
    ├── empty-state.tsx
    └── index.ts
```
