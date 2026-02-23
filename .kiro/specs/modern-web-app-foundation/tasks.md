---
feature: Modern Web Application Foundation
status: draft
created: 2026-02-09
---

# Implementation Plan: Modern Web Application Foundation

## Overview

This implementation plan breaks down the modern web application foundation into discrete, incremental tasks. Each task builds on previous work, starting with core infrastructure (Supabase, Drizzle), then authentication, followed by dashboard and profile features, and finally theme and polish.

The approach prioritizes getting a working authentication flow early, then expanding with dashboard and profile management features.

## Tasks

- [ ] 1. Setup project infrastructure and dependencies
  - Install required packages: @supabase/ssr, @supabase/supabase-js, drizzle-orm, postgres, drizzle-kit
  - Install form packages: react-hook-form, @hookform/resolvers, zod
  - Install UI packages: next-themes, sonner
  - Configure environment variables in `.env.local`
  - _Requirements: Technical Requirements - Frontend Stack, Backend Stack_

- [ ] 2. Configure Supabase clients and middleware
  - [ ] 2.1 Create Supabase client utilities
    - Implement `lib/supabase/client.ts` for browser client
    - Implement `lib/supabase/server.ts` for server client
    - Implement `lib/supabase/middleware.ts` for middleware client
    - _Requirements: Technical Requirements - Authentication Strategy_
  - [ ] 2.2 Create auth middleware
    - Implement `middleware.ts` with route protection logic
    - Add protected routes: /dashboard, /profile, /settings
    - Add auth routes redirect: /login, /register
    - _Requirements: 1.6 (Protected routes redirect)_

- [ ] 3. Setup Drizzle ORM and database schema
  - [ ] 3.1 Create database schema
    - Define `profiles` table in `lib/db/schema.ts`
    - Define `user_settings` table in `lib/db/schema.ts`
    - Export TypeScript types for tables
    - _Requirements: Technical Requirements - Database Schema_
  - [ ] 3.2 Configure Drizzle
    - Create `drizzle.config.ts` with database connection
    - Create `lib/db/index.ts` with db client
    - _Requirements: Technical Requirements - Database & ORM_
  - [ ] 3.3 Create and apply database migrations
    - Run `drizzle-kit generate:pg` to create migrations
    - Apply migrations to Supabase database
    - Create RLS policies for profiles and user_settings tables
    - _Requirements: Security Considerations - RLS Policies_

- [ ] 4. Create validation schemas
  - Create `lib/validations/auth.ts` with loginSchema, registerSchema, resetPasswordSchema
  - Create `lib/validations/profile.ts` with profileSchema, avatarSchema
  - _Requirements: 1.1, 1.2, 1.3 (Form validation)_

- [ ] 5. Implement authentication UI components
  - [ ] 5.1 Create login form component
    - Implement `components/auth/login-form.tsx` with form validation
    - Add loading states and error handling
    - Integrate with Supabase auth
    - _Requirements: 1.1, 1.2, 1.3, 1.4 (Login with validation and loading)_
  - [ ]\* 5.2 Write property test for login form validation
    - **Property 1: Form Validation Prevents Invalid Submissions**
    - Test that invalid emails are rejected
    - Test that passwords shorter than 8 characters are rejected
    - **Validates: Requirements 1.1, 1.2, 1.3**
  - [ ] 5.3 Create register form component
    - Implement `components/auth/register-form.tsx` with form validation
    - Add password confirmation matching
    - Add loading states and error handling
    - _Requirements: 1.1, 1.2, 1.3, 1.4 (Registration with validation)_
  - [ ] 5.4 Create reset password form component
    - Implement `components/auth/reset-password-form.tsx`
    - Add email validation and loading states
    - _Requirements: User Story 1 (Reset password)_

- [ ] 6. Create authentication pages
  - [ ] 6.1 Create login page
    - Implement `app/(auth)/login/page.tsx`
    - Add LoginForm component
    - Add link to register and reset password pages
    - _Requirements: User Story 1 (Login page)_
  - [ ] 6.2 Create register page
    - Implement `app/(auth)/register/page.tsx`
    - Add RegisterForm component
    - Add link to login page
    - _Requirements: User Story 1 (Registration page)_
  - [ ] 6.3 Create reset password page
    - Implement `app/(auth)/reset-password/page.tsx`
    - Add ResetPasswordForm component
    - _Requirements: User Story 1 (Reset password page)_

- [ ] 7. Checkpoint - Test authentication flow
  - Ensure all tests pass, ask the user if questions arise.
  - Verify login, register, and logout work correctly
  - Verify protected routes redirect to login
  - Verify session persists after page refresh

- [ ] 8. Setup theme system
  - [ ] 8.1 Create theme provider
    - Implement `app/providers.tsx` with ThemeProvider
    - Configure next-themes with system default
    - Update root layout to include providers
    - _Requirements: 4.3 (System preference default)_
  - [ ] 8.2 Create theme toggle component
    - Implement `components/theme-toggle.tsx`
    - Add light, dark, and system options
    - _Requirements: 4.1, 4.2 (Theme toggle and persistence)_
  - [ ]\* 8.3 Write property test for theme persistence
    - **Property 8: Theme Preference Persistence Round-Trip**
    - Test that theme selection persists after refresh
    - **Validates: Requirements 4.2**

- [ ] 9. Implement dashboard layout and components
  - [ ] 9.1 Create sidebar component
    - Implement `components/dashboard/sidebar.tsx`
    - Add navigation links (Dashboard, Profile, Settings)
    - Add active route highlighting
    - Include theme toggle in sidebar
    - _Requirements: 2.2 (Navigation sidebar)_
  - [ ] 9.2 Create user menu component
    - Implement `components/dashboard/user-menu.tsx`
    - Add user avatar, name, and email display
    - Add logout functionality
    - _Requirements: User Story 1 (Logout), 2.4 (User info display)_
  - [ ] 9.3 Create dashboard layout
    - Implement `app/(dashboard)/layout.tsx`
    - Integrate Sidebar and UserMenu components
    - Fetch user data from Supabase
    - _Requirements: 2.1, 2.2 (Dashboard layout)_
  - [ ]\* 9.4 Write property test for protected routes
    - **Property 3: Protected Routes Require Authentication**
    - Test that accessing protected routes without auth redirects to login
    - **Validates: Requirements 1.6, 2.1**

- [ ] 10. Create dashboard page with stats cards
  - [ ] 10.1 Create stats card component
    - Implement `components/dashboard/stats-card.tsx`
    - Add icon, title, value, and description props
    - _Requirements: 2.3 (Stats cards)_
  - [ ] 10.2 Create dashboard page
    - Implement `app/(dashboard)/dashboard/page.tsx`
    - Add welcome message with user name
    - Display 3-4 stats cards with sample data
    - Add loading skeleton for data fetch
    - _Requirements: 2.1, 2.3, 2.4, 2.5 (Dashboard with stats and loading)_
  - [ ]\* 10.3 Write property test for loading states
    - **Property 4: Loading Skeletons Display During Data Fetch**
    - Test that skeleton is shown while loading
    - Test that content replaces skeleton after load
    - **Validates: Requirements 2.5**

- [ ] 11. Implement profile management
  - [ ] 11.1 Create profile API route
    - Implement `app/api/user/profile/route.ts`
    - Add GET endpoint to fetch profile
    - Add PATCH endpoint to update profile
    - Use Drizzle ORM for database operations
    - _Requirements: User Story 3 (View and edit profile)_
  - [ ] 11.2 Create avatar upload API route
    - Implement `app/api/user/avatar/route.ts`
    - Add file validation (type, size)
    - Upload to Supabase Storage
    - Update profile with avatar URL
    - _Requirements: User Story 3 (Upload avatar)_
  - [ ] 11.3 Create profile form component
    - Implement `components/profile/profile-form.tsx`
    - Add fields: full name, username, bio
    - Add form validation with Zod
    - Add save and cancel buttons
    - _Requirements: 3.1, 3.5 (Profile form with validation and cancel)_
  - [ ] 11.4 Create avatar upload component
    - Implement `components/profile/avatar-upload.tsx`
    - Add file input with preview
    - Add upload progress indicator
    - _Requirements: 3.2 (Avatar preview before upload)_
  - [ ] 11.5 Create profile page
    - Implement `app/(dashboard)/profile/page.tsx`
    - Integrate ProfileForm and AvatarUpload components
    - Fetch current profile data
    - Add loading skeleton
    - _Requirements: User Story 3 (Profile page)_
  - [ ]\* 11.6 Write property test for profile persistence
    - **Property 6: Profile Data Persistence Round-Trip**
    - Test that profile updates persist after refresh
    - **Validates: Requirements 3.4**
  - [ ]\* 11.7 Write unit tests for profile API
    - Test GET endpoint returns user profile
    - Test PATCH endpoint updates profile
    - Test validation errors are returned
    - _Requirements: User Story 3_

- [ ] 12. Checkpoint - Test profile management
  - Ensure all tests pass, ask the user if questions arise.
  - Verify profile data loads correctly
  - Verify profile updates save successfully
  - Verify avatar upload works

- [ ] 13. Implement settings page
  - [ ] 13.1 Create settings API route
    - Implement `app/api/user/settings/route.ts`
    - Add GET endpoint to fetch settings
    - Add PATCH endpoint to update settings
    - Use Drizzle ORM for database operations
    - _Requirements: User Story 10 (Settings management)_
  - [ ] 13.2 Create settings page
    - Implement `app/(dashboard)/settings/page.tsx`
    - Add notification preferences toggles
    - Add theme preference selector
    - Add language selector
    - _Requirements: User Story 10 (Settings page)_

- [ ] 14. Add toast notification system
  - [ ] 14.1 Setup Sonner toast provider
    - Add Toaster component to root layout
    - Configure toast position and styling
    - _Requirements: User Story 5 (Toast notifications)_
  - [ ] 14.2 Integrate toasts in all operations
    - Add success toasts for: login, register, logout, profile update, avatar upload
    - Add error toasts for all failed operations
    - _Requirements: 3.3 (Success/error toasts)_
  - [ ]\* 14.3 Write property test for toast notifications
    - **Property 5: Operations Trigger Appropriate Toast Notifications**
    - Test that successful operations show success toast
    - Test that failed operations show error toast
    - **Validates: Requirements 3.3**

- [ ] 15. Add loading states and skeletons
  - [ ] 15.1 Create skeleton components
    - Create `components/ui/skeleton.tsx` (if not from shadcn/ui)
    - Create dashboard skeleton
    - Create profile skeleton
    - _Requirements: User Story 6 (Loading skeletons)_
  - [ ] 15.2 Integrate loading states
    - Add loading states to all async operations
    - Add button loading spinners
    - Add page-level loading skeletons
    - _Requirements: 1.4, 2.5 (Loading indicators)_
  - [ ]\* 15.3 Write property test for async loading states
    - **Property 2: Async Operations Show Loading States**
    - Test that loading indicator appears during async operations
    - Test that loading indicator disappears after completion
    - **Validates: Requirements 1.4**

- [ ] 16. Implement error handling
  - [ ] 16.1 Create error boundary component
    - Implement `components/error-boundary.tsx`
    - Add fallback UI for errors
    - Add retry functionality
    - _Requirements: User Story 7 (Error boundaries)_
  - [ ] 16.2 Create error pages
    - Create `app/not-found.tsx` for 404 errors
    - Create `app/error.tsx` for 500 errors
    - _Requirements: User Story 7 (Error pages)_
  - [ ] 16.3 Add error handling utilities
    - Create auth error handler
    - Create database error handler
    - Create file upload error handler
    - _Requirements: Error Handling section_

- [ ] 17. Add responsive mobile navigation
  - [ ] 17.1 Create mobile menu component
    - Implement hamburger menu for mobile
    - Use Sheet component from shadcn/ui
    - Show sidebar content in mobile menu
    - _Requirements: User Story 9 (Responsive navigation)_
  - [ ] 17.2 Update dashboard layout for mobile
    - Hide sidebar on mobile
    - Show hamburger menu button
    - Ensure responsive breakpoints work
    - _Requirements: 2.4 (Responsive design)_

- [ ] 18. Setup database triggers for automatic profile creation
  - [ ] 18.1 Create Supabase function for profile creation
    - Create database function to auto-create profile on user signup
    - Create trigger on auth.users insert
    - Create default user_settings on profile creation
    - _Requirements: Technical Requirements - Database Schema_

- [ ] 19. Add security enhancements
  - [ ] 19.1 Implement rate limiting (optional)
    - Add rate limiting to API routes
    - Configure limits for auth endpoints
    - _Requirements: Security Considerations - API Security_
  - [ ] 19.2 Add input sanitization
    - Sanitize user inputs in API routes
    - Add XSS protection
    - _Requirements: Security Considerations - Input Validation_

- [ ] 20. Final checkpoint and testing
  - Ensure all tests pass, ask the user if questions arise.
  - Test complete user flow: register → login → dashboard → profile → settings → logout
  - Verify all property tests pass
  - Verify theme switching works across all pages
  - Verify session persistence
  - Verify error handling works correctly

- [ ]\* 21. Write comprehensive property tests
  - [ ]\* 21.1 Property test for theme toggle accessibility
    - **Property 7: Theme Toggle Accessible on All Pages**
    - Test that theme toggle exists on all pages
    - **Validates: Requirements 4.1**
  - [ ]\* 21.2 Property test for theme support
    - **Property 9: All Components Support Both Themes**
    - Test that all components render in both light and dark themes
    - **Validates: Requirements 4.5**

- [ ]\* 22. Write integration tests
  - [ ]\* 22.1 Test authentication flow
    - Test complete registration flow
    - Test complete login flow
    - Test logout flow
    - _Requirements: User Story 1_
  - [ ]\* 22.2 Test profile management flow
    - Test profile view and edit
    - Test avatar upload
    - _Requirements: User Story 3_
  - [ ]\* 22.3 Test settings management flow
    - Test settings view and update
    - _Requirements: User Story 10_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation follows an incremental approach: infrastructure → auth → dashboard → profile → polish
- Supabase handles authentication, so no custom auth API routes needed
- Drizzle ORM provides type-safe database access
- All forms use React Hook Form + Zod for validation
- Theme system uses next-themes for persistence and system preference support
