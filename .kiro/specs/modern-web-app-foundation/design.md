---
feature: Modern Web Application Foundation
status: draft
created: 2026-02-09
---

# Design Document: Modern Web Application Foundation

## Overview

This design document outlines the technical architecture for a modern web application foundation built with Next.js 14 App Router, Supabase Auth, and Drizzle ORM. The system provides authentication, user profile management, dashboard interface, and theme switching capabilities.

The architecture follows a server-first approach leveraging Next.js App Router's server components, with client-side interactivity where needed. Authentication is handled by Supabase Auth with server-side session management, while Drizzle ORM provides type-safe database access to PostgreSQL.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App Router                    │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │ Server Components│         │ Client Components│         │
│  │  - Dashboard     │         │  - Auth Forms    │         │
│  │  - Profile Page  │         │  - Theme Toggle  │         │
│  │  - Settings      │         │  - Toasts        │         │
│  └────────┬─────────┘         └────────┬─────────┘         │
│           │                            │                    │
│           └────────────┬───────────────┘                    │
│                        │                                    │
└────────────────────────┼────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Supabase   │  │   Drizzle   │  │   Storage   │
│    Auth     │  │     ORM     │  │  (Avatars)  │
│             │  │             │  │             │
│  - Sessions │  │  - Queries  │  │  - Upload   │
│  - Users    │  │  - Schemas  │  │  - Retrieve │
└─────────────┘  └──────┬──────┘  └─────────────┘
                        │
                        ▼
                ┌─────────────┐
                │ PostgreSQL  │
                │  Database   │
                │             │
                │  - Profiles │
                │  - Settings │
                └─────────────┘
```

### Technology Stack

**Frontend:**

- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- shadcn/ui components
- next-themes (theme management)
- sonner (toast notifications)
- next-safe-action (Server Actions with type safety)

**Backend:**

- Supabase Auth (authentication)
- Supabase Storage (file uploads)
- PostgreSQL (database)
- Drizzle ORM (database access)

**Forms & Validation:**

- React Hook Form
- Zod (schema validation)
- next-safe-action (Server Actions)

**Architecture:**

- **No API Routes** - Using Next.js Server Actions instead
- **Service Layer** - Business logic in separate `@workspace/services` package
- **Type-safe Actions** - Using next-safe-action for validated server actions
- **Monorepo Structure** - Shared services across apps

### Directory Structure

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── actions/                    # Server Actions (using next-safe-action)
│   │   ├── auth.ts                 # Login, register, logout actions
│   │   ├── profile.ts              # Profile update actions
│   │   └── settings.ts             # Settings update actions
│   ├── layout.tsx                  # Root layout
│   └── middleware.ts               # Auth middleware
├── components/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── reset-password-form.tsx
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── stats-card.tsx
│   │   └── user-menu.tsx
│   ├── profile/
│   │   ├── profile-form.tsx
│   │   └── avatar-upload.tsx
│   ├── ui/                         # shadcn/ui components
│   └── theme-toggle.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server client
│   │   └── middleware.ts           # Middleware client
│   └── utils.ts
└── drizzle.config.ts

packages/services/                  # Shared service layer
├── src/
│   ├── auth/
│   │   ├── auth.service.ts         # Auth business logic
│   │   └── index.ts
│   ├── user/
│   │   ├── profile.service.ts      # Profile business logic
│   │   ├── settings.service.ts     # Settings business logic
│   │   └── index.ts
│   ├── db/
│   │   ├── schema.ts               # Drizzle schemas
│   │   ├── index.ts                # DB connection
│   │   └── migrations/             # Migration files
│   ├── validations/
│   │   ├── auth.ts                 # Auth schemas
│   │   ├── profile.ts              # Profile schemas
│   │   └── index.ts
│   └── index.ts                    # Main exports
├── package.json
├── tsconfig.json
└── drizzle.config.ts
```

## Components and Interfaces

### 1. Authentication System

#### Supabase Client Setup

**Server-Side Client (for Server Components & API Routes):**

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie setting errors
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Handle cookie removal errors
          }
        },
      },
    },
  );
}
```

**Client-Side Client (for Client Components):**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

**Middleware Client (for Auth Middleware):**

```typescript
// lib/supabase/middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );

  await supabase.auth.getUser();

  return response;
}
```

#### Auth Middleware

```typescript
// middleware.ts
import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // Get session from response
  const supabase = createServerClient(...)
  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes
  const protectedPaths = ['/dashboard', '/profile', '/settings']
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Redirect to login if accessing protected route without session
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if accessing auth pages with active session
  const authPaths = ['/login', '/register']
  const isAuthPath = authPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

#### Login Form Component

```typescript
// components/auth/login-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Logged in successfully')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Log in'}
      </Button>
    </form>
  )
}
```

### 2. Database Schema (Drizzle ORM)

#### Schema Definitions

```typescript
// lib/db/schema.ts
import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

// Extended user profile (references Supabase auth.users)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // References auth.users.id
  fullName: text("full_name"),
  username: text("username").unique(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User settings
export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  pushNotifications: boolean("push_notifications").default(true).notNull(),
  theme: text("theme").default("system").notNull(), // 'light' | 'dark' | 'system'
  language: text("language").default("th").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type exports
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
```

#### Database Connection

```typescript
// lib/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// For migrations
export const migrationClient = postgres(connectionString, { max: 1 });

// For queries
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });
```

#### Drizzle Configuration

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

### 3. Dashboard Layout

#### Sidebar Component

```typescript
// components/dashboard/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from './user-menu'
import {
  LayoutDashboard,
  User,
  Settings,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  user: {
    email: string
    fullName?: string
    avatarUrl?: string
  }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">MyApp</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t p-4 space-y-4">
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </div>
  )
}
```

#### User Menu Component

```typescript
// components/dashboard/user-menu.tsx
'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { toast } from 'sonner'

interface UserMenuProps {
  user: {
    email: string
    fullName?: string
    avatarUrl?: string
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error('Failed to log out')
      return
    }

    toast.success('Logged out successfully')
    router.push('/login')
    router.refresh()
  }

  const initials = user.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email[0].toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.fullName || user.email} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-sm">
            <span className="font-medium">{user.fullName || 'User'}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 4. Theme System

#### Theme Provider Setup

```typescript
// app/providers.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

#### Theme Toggle Component

```typescript
// components/theme-toggle.tsx
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 5. Profile Management

#### Profile API Route

```typescript
// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
});

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  return NextResponse.json({ profile });
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const [updatedProfile] = await db
      .update(profiles)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id))
      .returning();

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

## Data Models

### TypeScript Types

```typescript
// types/index.ts

// User types
export interface User {
  id: string;
  email: string;
  emailConfirmed: boolean;
  createdAt: string;
}

// Profile types
export interface Profile {
  id: string;
  fullName: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Settings types
export interface UserSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: "light" | "dark" | "system";
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileFormData {
  fullName: string;
  username: string;
  bio: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
```

### Validation Schemas

```typescript
// lib/validations/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});
```

```typescript
// lib/validations/profile.ts
import { z } from "zod";

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must be less than 100 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    )
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

export const avatarSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB",
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "File must be a JPEG, PNG, or WebP image",
    ),
});
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Form Validation Prevents Invalid Submissions

_For any_ authentication form (login, register, reset password), when the form contains invalid data (invalid email format, password shorter than 8 characters), the form submission should be prevented and validation errors should be displayed.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Async Operations Show Loading States

_For any_ asynchronous operation (login, register, profile update, avatar upload), while the operation is in progress, a loading indicator should be visible, and when the operation completes (success or failure), the loading indicator should be hidden.

**Validates: Requirements 1.4**

### Property 3: Protected Routes Require Authentication

_For any_ protected route (dashboard, profile, settings), when accessed without an active session, the user should be redirected to the login page.

**Validates: Requirements 1.6, 2.1**

### Property 4: Loading Skeletons Display During Data Fetch

_For any_ page that fetches data on load (dashboard, profile, settings), while the data is being fetched, skeleton loading components should be rendered, and once data is loaded, the actual content should replace the skeletons.

**Validates: Requirements 2.5**

### Property 5: Operations Trigger Appropriate Toast Notifications

_For any_ user operation (login, logout, profile update, avatar upload), successful operations should display a success toast notification, and failed operations should display an error toast notification with a descriptive message.

**Validates: Requirements 3.3**

### Property 6: Profile Data Persistence Round-Trip

_For any_ valid profile update (full name, username, bio), after successfully updating the profile and refreshing the page, the displayed profile data should match the updated values.

**Validates: Requirements 3.4**

### Property 7: Theme Toggle Accessible on All Pages

_For any_ page in the application (auth pages, dashboard, profile, settings), the theme toggle component should be present and functional.

**Validates: Requirements 4.1**

### Property 8: Theme Preference Persistence Round-Trip

_For any_ theme selection (light, dark, system), after selecting a theme and refreshing the page, the application should display in the selected theme.

**Validates: Requirements 4.2**

### Property 9: All Components Support Both Themes

_For any_ component in the application, when the theme is toggled between light and dark modes, the component should render without errors and display appropriate theme-specific styling.

**Validates: Requirements 4.5**

## Error Handling

### Authentication Errors

**Supabase Auth Error Handling:**

```typescript
// Error types from Supabase
type AuthError = {
  message: string;
  status: number;
};

// Common auth errors
const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Invalid login credentials",
  USER_NOT_FOUND: "User not found",
  EMAIL_EXISTS: "Email already registered",
  WEAK_PASSWORD: "Password is too weak",
  NETWORK_ERROR: "Network error, please try again",
};

// Error handler utility
function handleAuthError(error: AuthError): string {
  switch (error.status) {
    case 400:
      return error.message || AUTH_ERRORS.INVALID_CREDENTIALS;
    case 422:
      return AUTH_ERRORS.WEAK_PASSWORD;
    case 500:
      return AUTH_ERRORS.NETWORK_ERROR;
    default:
      return error.message || "An unexpected error occurred";
  }
}
```

**Error Display Strategy:**

- Display errors inline for form validation
- Use toast notifications for operation errors
- Provide clear, actionable error messages
- Never expose sensitive error details to users

### Database Errors

**Drizzle ORM Error Handling:**

```typescript
// Database operation wrapper
async function safeDbOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string = "Database operation failed",
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    console.error("Database error:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("unique constraint")) {
        return { error: "This value is already taken" };
      }
      if (error.message.includes("foreign key constraint")) {
        return { error: "Related record not found" };
      }
    }

    return { error: errorMessage };
  }
}
```

**Error Recovery:**

- Retry failed queries with exponential backoff
- Provide fallback data when appropriate
- Log errors for debugging
- Display user-friendly error messages

### File Upload Errors

**Avatar Upload Error Handling:**

```typescript
// File validation
function validateAvatarFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  if (file.size > MAX_SIZE) {
    return { valid: false, error: "File size must be less than 5MB" };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "File must be a JPEG, PNG, or WebP image" };
  }

  return { valid: true };
}

// Upload with error handling
async function uploadAvatar(file: File, userId: string) {
  const validation = validateAvatarFile(file);
  if (!validation.valid) {
    return { error: validation.error };
  }

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return { data: { url: publicUrl } };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Failed to upload avatar" };
  }
}
```

### Network Errors

**Retry Strategy:**

```typescript
// Retry utility with exponential backoff
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
```

### Error Boundaries

**React Error Boundary:**

```typescript
// components/error-boundary.tsx
'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={() => this.setState({ hasError: false })}>
              Try again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

## Testing Strategy

### Dual Testing Approach

This project employs both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs

Together, these approaches provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness.

### Property-Based Testing

**Library:** We will use **fast-check** for property-based testing in TypeScript/JavaScript.

**Configuration:**

- Each property test runs a minimum of 100 iterations
- Each test references its design document property
- Tag format: `Feature: modern-web-app-foundation, Property {number}: {property_text}`

**Example Property Test:**

```typescript
// __tests__/auth/validation.property.test.ts
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { loginSchema } from "@/lib/validations/auth";

describe("Property Tests: Form Validation", () => {
  // Feature: modern-web-app-foundation, Property 1: Form Validation Prevents Invalid Submissions
  it("should reject passwords shorter than 8 characters", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 7 }), // Generate short passwords
        fc.emailAddress(), // Generate valid emails
        (password, email) => {
          const result = loginSchema.safeParse({ email, password });
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(
              result.error.issues.some((issue) =>
                issue.path.includes("password"),
              ),
            ).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: modern-web-app-foundation, Property 1: Form Validation Prevents Invalid Submissions
  it("should reject invalid email formats", () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !s.includes("@")), // Generate invalid emails
        fc.string({ minLength: 8 }), // Generate valid passwords
        (email, password) => {
          const result = loginSchema.safeParse({ email, password });
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(
              result.error.issues.some((issue) => issue.path.includes("email")),
            ).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
```

### Unit Testing

**Library:** Vitest (for unit tests) + React Testing Library (for component tests)

**Test Categories:**

1. **Component Tests:**
   - Login/Register form rendering
   - Theme toggle functionality
   - User menu interactions
   - Toast notifications display

2. **API Route Tests:**
   - Profile update endpoint
   - Avatar upload endpoint
   - Settings update endpoint
   - Error responses

3. **Utility Function Tests:**
   - Validation schemas
   - Error handlers
   - File validators
   - Retry logic

4. **Integration Tests:**
   - Authentication flow (login → dashboard)
   - Profile update flow (edit → save → verify)
   - Theme persistence (change → refresh → verify)

**Example Unit Test:**

```typescript
// __tests__/components/auth/login-form.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '@/components/auth/login-form'

describe('LoginForm', () => {
  it('should display validation errors for invalid inputs', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /log in/i })

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: 'short' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('should show loading state during submission', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /log in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    expect(screen.getByText(/logging in/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
})
```

### Test Coverage Goals

- **Overall Coverage:** > 80%
- **Critical Paths:** > 95% (auth, profile updates)
- **Utility Functions:** 100%
- **Error Handlers:** > 90%

### Testing Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run only property tests
pnpm test:property

# Run only unit tests
pnpm test:unit
```

## Security Considerations

### Row Level Security (RLS) Policies

**Profiles Table:**

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users cannot delete profiles
-- (No DELETE policy = no one can delete)
```

**User Settings Table:**

```sql
-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can manage their own settings
CREATE POLICY "Users can manage own settings"
  ON user_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Storage Bucket (Avatars):**

```sql
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Users can upload their own avatars
CREATE POLICY "Users can upload own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own avatars
CREATE POLICY "Users can update own avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');
```

### Input Validation

**Server-Side Validation:**

- All API routes validate input using Zod schemas
- Never trust client-side validation alone
- Sanitize user input before database operations
- Validate file uploads (type, size, content)

**SQL Injection Prevention:**

- Drizzle ORM uses parameterized queries
- Never concatenate user input into SQL
- Use ORM methods for all database operations

### Authentication Security

**Session Management:**

- Sessions stored in HTTP-only cookies
- Automatic token refresh by Supabase
- Secure cookie flags in production
- CSRF protection via SameSite cookies

**Password Security:**

- Minimum 8 characters enforced
- Complexity requirements (uppercase, lowercase, number)
- Passwords hashed by Supabase (bcrypt)
- Never store or log passwords

### API Security

**Rate Limiting:**

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
});

// Usage in API routes
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response("Too many requests", { status: 429 });
  }

  // Handle request...
}
```

**CORS Configuration:**

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.ALLOWED_ORIGIN || "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PATCH,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};
```

### Environment Variables

**Required Variables:**

```env
# Supabase (Public - safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase (Private - server-only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (Private - server-only)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# Rate Limiting (Private - server-only, optional)
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

**Security Rules:**

- Never commit `.env` files
- Use `.env.local` for local development
- Use platform environment variables in production
- Validate all required env vars on startup

## Performance Optimizations

### Next.js Optimizations

**Server Components:**

- Use Server Components by default
- Only use Client Components when needed (interactivity, hooks)
- Fetch data in Server Components for better performance

**Image Optimization:**

```typescript
import Image from 'next/image'

// Optimized avatar display
<Image
  src={avatarUrl}
  alt="User avatar"
  width={40}
  height={40}
  className="rounded-full"
  priority={false}
  loading="lazy"
/>
```

**Code Splitting:**

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic'

const ProfileEditor = dynamic(() => import('@/components/profile/profile-editor'), {
  loading: () => <ProfileSkeleton />,
  ssr: false,
})
```

### Database Optimizations

**Indexes:**

```sql
-- Index on username for fast lookups
CREATE INDEX idx_profiles_username ON profiles(username);

-- Index on user_id for settings lookups
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

**Connection Pooling:**

- Use Supabase connection pooler
- Configure appropriate pool size
- Reuse database connections

### Caching Strategy

**Static Generation:**

- Use `generateStaticParams` for static pages
- Cache public data at build time

**Revalidation:**

```typescript
// Revalidate profile data every 60 seconds
export const revalidate = 60;

// Or use on-demand revalidation
import { revalidatePath } from "next/cache";

// After profile update
revalidatePath("/profile");
```

## Deployment Considerations

### Environment Setup

**Supabase Project:**

1. Create project on Supabase
2. Enable Email Auth
3. Create avatars storage bucket
4. Apply RLS policies
5. Run database migrations

**Vercel Deployment:**

1. Connect GitHub repository
2. Configure environment variables
3. Set build command: `pnpm build`
4. Set output directory: `.next`
5. Enable automatic deployments

### Database Migrations

**Migration Workflow:**

```bash
# Generate migration from schema changes
pnpm drizzle-kit generate:pg

# Apply migrations to database
pnpm drizzle-kit push:pg

# Or use custom migration script
pnpm db:migrate
```

**Migration Script:**

```typescript
// scripts/migrate.ts
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, migrationClient } from "@/lib/db";

async function main() {
  console.log("Running migrations...");

  await migrate(db, {
    migrationsFolder: "./lib/db/migrations",
  });

  console.log("Migrations complete!");
  await migrationClient.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
```

### Monitoring and Logging

**Error Tracking:**

- Use Sentry for error tracking
- Log errors with context
- Set up alerts for critical errors

**Performance Monitoring:**

- Use Vercel Analytics
- Monitor Core Web Vitals
- Track API response times

## Future Enhancements

### Phase 2 Features

1. **Email Verification:**
   - Verify email on signup
   - Resend verification email
   - Update email with verification

2. **Social Authentication:**
   - Google OAuth
   - GitHub OAuth
   - Facebook OAuth

3. **Two-Factor Authentication:**
   - TOTP-based 2FA
   - Backup codes
   - Recovery options

4. **Advanced Profile Features:**
   - Cover photos
   - Custom profile URLs
   - Profile visibility settings

5. **Real-time Features:**
   - Online status
   - Real-time notifications
   - Live updates

### Scalability Considerations

**Database:**

- Implement read replicas for scaling reads
- Use database sharding for large datasets
- Optimize queries with proper indexes

**Caching:**

- Implement Redis for session caching
- Cache frequently accessed data
- Use CDN for static assets

**API:**

- Implement API versioning
- Add request queuing for heavy operations
- Use background jobs for async tasks

---

**Document Status:** Draft - Ready for Review
**Last Updated:** 2026-02-09
**Next Steps:** Review design, create implementation tasks
