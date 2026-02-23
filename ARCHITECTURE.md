# Project Architecture

This monorepo follows a clean architecture pattern with clear separation of concerns.

## Package Structure

```
packages/
├── db/                    # Database layer
├── validations/           # Validation schemas
├── services/              # Business logic
├── supabase/              # Supabase client utilities
└── ui/                    # Shared UI components

apps/
└── web/                   # Next.js application
```

## Layer Responsibilities

### 1. Database Layer (`@workspace/db`)

**Purpose:** Database schema and connection management

**Contains:**

- Drizzle ORM schemas
- Database connection
- Type definitions
- Migrations

**Usage:**

```typescript
import { db, profiles, userSettings } from '@workspace/db'

const profile = await db.select().from(profiles).where(...)
```

**Dependencies:** `drizzle-orm`, `postgres`

---

### 2. Validation Layer (`@workspace/validations`)

**Purpose:** Input validation and type safety

**Contains:**

- Zod schemas for all inputs
- Type exports
- Validation rules

**Usage:**

```typescript
import { loginSchema, profileSchema } from "@workspace/validations";

const result = loginSchema.parse(input);
```

**Dependencies:** `zod`

---

### 3. Supabase Layer (`@workspace/supabase`)

**Purpose:** Supabase client utilities for authentication and storage

**Contains:**

- Browser client (for Client Components)
- Server client (for Server Components & Actions)
- Middleware client (for route protection)

**Usage:**

```typescript
// Client Component
import { createClient } from "@workspace/supabase/client";

// Server Component
import { createClient } from "@workspace/supabase/server";

// Middleware
import { updateSession, createClient } from "@workspace/supabase/middleware";
```

**Dependencies:** `@supabase/ssr`, `@supabase/supabase-js`

---

### 4. Services Layer (`@workspace/services`)

**Purpose:** Business logic and data operations

**Contains:**

- ProfileService
- SettingsService
- Other business logic

**Usage:**

```typescript
import { ProfileService } from "@workspace/services";

const profile = await ProfileService.getProfile(userId);
```

**Dependencies:** `@workspace/db`, `@workspace/validations`

---

### 5. UI Layer (`@workspace/ui`)

**Purpose:** Shared UI components (shadcn/ui)

**Contains:**

- Button, Input, Label, etc.
- Utility functions
- Global styles

**Usage:**

```typescript
import { Button } from "@workspace/ui/components/button";
```

---

## Application Layer (`apps/web`)

**Purpose:** Next.js application with UI and Server Actions

**Structure:**

```
apps/web/
├── app/
│   ├── actions/           # Server Actions (next-safe-action)
│   │   ├── auth.ts
│   │   ├── profile.ts
│   │   └── settings.ts
│   ├── (auth)/            # Auth pages
│   └── (dashboard)/       # Protected pages
├── components/            # React components
├── lib/
│   └── safe-action.ts     # Action client setup
└── middleware.ts          # Route protection
```

**Key Principles:**

- ✅ No API routes (uses Server Actions)
- ✅ Business logic in services layer
- ✅ Validation in validations layer
- ✅ Database access through services
- ✅ Type-safe actions with next-safe-action

---

## Data Flow

### Authentication Flow

```
User Input (Client)
  ↓
Login Form Component
  ↓
Server Action (loginAction)
  ↓
Validation (@workspace/validations)
  ↓
Supabase Auth (@workspace/supabase)
  ↓
Success → Redirect to Dashboard
```

### Data Mutation Flow

```
User Input (Client)
  ↓
Form Component
  ↓
Server Action (updateProfileAction)
  ↓
Validation (@workspace/validations)
  ↓
Service Layer (@workspace/services)
  ↓
Database Layer (@workspace/db)
  ↓
Success → Revalidate & Return
```

---

## Benefits of This Architecture

### 1. **Separation of Concerns**

- Each layer has a single responsibility
- Easy to understand and maintain
- Clear boundaries between layers

### 2. **Reusability**

- Packages can be used by multiple apps
- Shared logic in one place
- Consistent behavior across apps

### 3. **Type Safety**

- End-to-end type safety
- Zod schemas generate TypeScript types
- Drizzle ORM provides database types

### 4. **Testability**

- Each layer can be tested independently
- Mock dependencies easily
- Clear interfaces between layers

### 5. **Scalability**

- Add new apps easily
- Share packages across apps
- Independent deployment possible

---

## Adding a New Feature

1. **Define validation schema** in `@workspace/validations`
2. **Create database schema** in `@workspace/db` (if needed)
3. **Implement business logic** in `@workspace/services`
4. **Create Server Action** in `apps/web/app/actions`
5. **Build UI components** in `apps/web/components`
6. **Create pages** in `apps/web/app`

---

## Environment Variables

Each app needs these environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Database (for Drizzle)
DATABASE_URL=postgresql://...
```

---

## Development Workflow

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Database

```bash
cd packages/db
pnpm db:generate  # Generate migrations
# Then run migrations in Supabase SQL Editor
```

### 3. Run Development Server

```bash
cd apps/web
pnpm dev
```

### 4. Add New Package

```bash
# Create package structure
mkdir -p packages/my-package/src
cd packages/my-package

# Create package.json
pnpm init

# Add to workspace
# (Already configured in pnpm-workspace.yaml)
```

---

## Best Practices

### ✅ DO

- Keep business logic in services layer
- Use Server Actions instead of API routes
- Validate all inputs with Zod
- Use type-safe database queries
- Revalidate paths after mutations
- Handle errors gracefully

### ❌ DON'T

- Put business logic in components
- Access database directly from actions
- Skip validation
- Use any types
- Forget to revalidate after mutations
- Expose sensitive data to client

---

## Migration Guide

### From API Routes to Server Actions

**Before:**

```typescript
// app/api/profile/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  // ...
}
```

**After:**

```typescript
// app/actions/profile.ts
"use server";

export const updateProfileAction = authAction
  .schema(profileSchema)
  .action(async ({ parsedInput, ctx }) => {
    // ...
  });
```

### From Direct DB Access to Services

**Before:**

```typescript
const profile = await db.select().from(profiles).where(...)
```

**After:**

```typescript
const profile = await ProfileService.getProfile(userId);
```

---

## Troubleshooting

### Package Not Found

```bash
pnpm install
```

### Type Errors

```bash
cd apps/web
pnpm typecheck
```

### Database Connection Issues

Check `DATABASE_URL` in `.env.local`

### Supabase Auth Issues

Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
