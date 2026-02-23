# Services Package

Shared business logic and database layer for the application.

## Setup Database

### 1. Run Migrations

Go to your Supabase project dashboard → SQL Editor and run these files in order:

1. **First**, run the migration file:

   ```sql
   -- Copy content from: src/db/migrations/0000_secret_purple_man.sql
   ```

2. **Then**, run the setup file for RLS policies and triggers:
   ```sql
   -- Copy content from: src/db/migrations/setup.sql
   ```

### 2. Verify Setup

After running the migrations, verify:

- ✅ Tables `profiles` and `user_settings` are created
- ✅ RLS policies are enabled
- ✅ Trigger `on_auth_user_created` is created

## Development

### Generate Migrations

```bash
pnpm db:generate
```

### Push Schema to Database

```bash
pnpm db:push
```

### Open Drizzle Studio

```bash
pnpm db:studio
```

## Architecture

- **Services**: Business logic layer (auth, profile, settings)
- **Database**: Drizzle ORM with PostgreSQL
- **Validations**: Zod schemas for type-safe validation

## Usage in Next.js

```typescript
// Import services
import { ProfileService, SettingsService } from "@workspace/services";

// Import validations
import { loginSchema, profileSchema } from "@workspace/services/validations";

// Import database
import { db, profiles } from "@workspace/services/db";
```
