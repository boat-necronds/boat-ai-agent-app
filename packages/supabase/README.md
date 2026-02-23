# Supabase Package

Shared Supabase client utilities for all apps in the monorepo.

## Installation

This package is already included in the workspace. Just import it:

```typescript
import { createClient } from "@workspace/supabase/client";
import { createClient } from "@workspace/supabase/server";
import { updateSession } from "@workspace/supabase/middleware";
```

## Usage

### Client Components

```tsx
"use client";

import { createClient } from "@workspace/supabase/client";

export function MyClientComponent() {
  const supabase = createClient();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: "user@example.com",
      password: "password",
    });
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### Server Components

```tsx
import { createClient } from "@workspace/supabase/server";

export default async function MyServerComponent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <div>Hello {user?.email}</div>;
}
```

### Server Actions

```typescript
"use server";

import { createClient } from "@workspace/supabase/server";

export async function myAction() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("table").select();

  return data;
}
```

### Middleware

```typescript
// middleware.ts
import { updateSession, createClient } from "@workspace/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Update session
  const response = await updateSession(request);

  // Check authentication
  const supabase = createClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}
```

## Environment Variables

Make sure these are set in your app's `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Features

- ✅ Type-safe Supabase clients
- ✅ Automatic cookie management
- ✅ Server-side session handling
- ✅ Middleware support
- ✅ Reusable across multiple apps
