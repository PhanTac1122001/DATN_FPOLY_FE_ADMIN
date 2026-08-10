# Profile API Integration & Personal Profile Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the backend staff profile API into the `AdminHeader` component and build a full-featured Personal Profile page (`/profile`) allowing users to view and update their profile details (name, phone, address, gender, avatar) and change their password.

**Architecture:** Extend `auth.service.ts` to include update profile, upload avatar, and change password methods. Create a user dropdown in `AdminHeader` and build the `/profile` page using Next.js App Router with dual tabs (Personal Info and Change Password) and React Query invalidation upon save.

**Tech Stack:** Next.js 15 App Router, React 19, React Query, TailwindCSS, Lucide Icons, TypeScript, `toast.service`.

## Global Constraints
- Target workspace: `lms-portal-admin` (`c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin`)
- Follow existing codebase UI components and styling conventions.
- All file links must be relative to `lms-portal-admin` root or standard absolute paths.

---

### Task 1: Update Auth Types & Service Layer
**Files:**
- Modify: `src/types/auth.types.ts`
- Modify: `src/services/auth.service.ts`

**Interfaces:**
- Consumes: `API_ENDPOINTS.AUTH.PROFILE`, `UPDATE_PROFILE`, `CHANGE_PASSWORD`, `/v1/staff/profile/avatar/upload`
- Produces: `UserProfile` with `address`, `gender`, `staffCode`; `updateProfile`, `uploadAvatar`, `changePassword` methods in `auth.service.ts`

- [ ] **Step 1: Extend UserProfile interface and request types in auth.types.ts**
Update `UserProfile`, `UpdateProfileRequest`, `ChangePasswordRequest` interfaces to include `address`, `gender`, `staffCode`, `phone`.

- [ ] **Step 2: Update mapBackendStaffToUserProfile and profile services in auth.service.ts**
Map backend fields (`address`, `gender`, `staffCode`, `phone`, `avatar`) accurately. Implement `updateProfile`, `uploadAvatar`, and `changePassword`.

- [ ] **Step 3: Verify TypeScript compilation**
Run `npx tsc --noEmit` to ensure types compile without errors.

---

### Task 2: Enhance AdminHeader with User Profile Dropdown
**Files:**
- Modify: `src/components/layout/admin/admin-header.tsx`
- Create: `src/components/layout/admin/user-dropdown.tsx`

**Interfaces:**
- Consumes: `useAuth`, `useLogout`, `UserProfile`
- Produces: `UserDropdown` component integrated into `AdminHeader`

- [ ] **Step 1: Create UserDropdown component**
Build `user-dropdown.tsx` with popup/dropdown menu displaying current user info, quick links to `/profile` and `/profile?tab=password`, and logout button.

- [ ] **Step 2: Replace static user box in AdminHeader**
Import and render `UserDropdown` inside `admin-header.tsx`.

---

### Task 3: Build Personal Profile Page & View Component
**Files:**
- Create: `src/app/profile/page.tsx`
- Create: `src/views/profile/profile-view.tsx`
- Modify: `src/constants/ui-text.constants.ts` (add metadata & profile UI texts)

**Interfaces:**
- Consumes: `useAuth`, `updateProfile`, `uploadAvatar`, `changePassword`, `queryKeys.profile()`
- Produces: Personal Profile Page `/profile` with tabs for Profile Details and Password Change.

- [ ] **Step 1: Add profile UI texts to ui-text.constants.ts**
Add metadata and label translations for Profile page UI.

- [ ] **Step 2: Create profile view component with profile form, avatar uploader & password tab**
Implement `profile-view.tsx` with reactive forms, avatar uploader, tab state, toast feedback, and query invalidation on mutation success.

- [ ] **Step 3: Create App route page src/app/profile/page.tsx**
Create the Next.js page exporting metadata and rendering `ProfileView`.

---

### Task 4: End-to-End Verification & Walkthrough
**Files:**
- Test UI & API connectivity on local dev server.

- [ ] **Step 1: Check build & run dev server**
Ensure project builds cleanly (`npm run build` or `npx tsc --noEmit`).

- [ ] **Step 2: Verify user flow and update documentation**
Verify header dropdown, personal info updates, avatar upload, password change, and React Query profile cache updates.
