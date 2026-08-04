# Staff Navbar & Staff Management Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate real staff profiles and avatars into the Navbar, and build a premium, fully functional Staff Management CRUD page with training systems mapping.

**Architecture:** Extend existing user profile mappings, introduce a `staff.service.ts` communicating with the backend APIs via `httpClient`, and design a new route `/staff` showing KPI metrics, search filters, a stylized React-Aria Table, and Slideout CRUD forms.

**Tech Stack:** Next.js (App Router), React, TanStack Query, TailwindCSS, React Aria Components, Lucide Icons, Zod, React Hook Form.

## Global Constraints
- Target platform: Node.js (Windows shell)
- Project directory: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin`
- Backend endpoint: `http://103.118.29.137:6789`
- No placeholders or mock paths; all endpoints must query live databases (except fallback mock profile on offline/no token).

---

### Task 1: Type & Auth Service Updates

**Files:**
- Modify: `src/types/auth.types.ts:46-56`
- Modify: `src/services/auth.service.ts:90-145`

**Interfaces:**
- Consumes: Backend API `/api/staff/profile/me` payload.
- Produces: Updated `UserProfile` object exposing `roles?: string[]`.

- [ ] **Step 1: Update UserProfile Interface**
  Modify `src/types/auth.types.ts` to add `roles?: string[]` to the `UserProfile` interface:
  ```typescript
  export interface UserProfile {
      id: string;
      email: string;
      fullName: string;
      avatarUrl?: string | null;
      phoneNumber?: string | null;
      role: string;
      roles?: string[];
      permissions: string[];
      createdAt?: string | Date;
      lastLoginAt?: string | Date | null;
  }
  ```

- [ ] **Step 2: Update Profile Mapping in AuthService**
  Modify `mapBackendStaffToUserProfile` in `src/services/auth.service.ts` to attach `roles: roleNames`:
  ```typescript
  function mapBackendStaffToUserProfile(staff: any): UserProfile {
      if (!staff) {
          throw new Error("Invalid staff profile payload");
      }
      const roleNames = (staff.roles || []).map((r: any) => r.name);
      
      // Default role mappings
      let role = "ADMIN";
      if (roleNames.includes("TEACHER") || roleNames.includes("TEACHER_ASSISTANT") || roleNames.includes("ASSISTANT")) {
          role = "INSTRUCTOR";
      }

      // Default permissions based on roles
      let permissions: string[] = ["VIEW_USERS"];
      if (roleNames.includes("ADMIN") || roleNames.includes("MANAGER")) {
          permissions = ["MANAGE_USERS", "VIEW_USERS", "admin", "manage_users", "manage_courses"];
      } else {
          permissions = ["VIEW_USERS", "teacher", "manage_courses"];
      }

      return {
          id: staff.id || staff._id || "",
          email: staff.email || "",
          fullName: staff.fullName || "",
          avatarUrl: staff.avatar || null,
          phoneNumber: staff.phone || null,
          role: role,
          roles: roleNames,
          permissions: permissions,
          createdAt: staff.createdAt,
      };
  }
  ```
  Also update the mock profile in `getProfile()` to include the fallback `roles`:
  ```typescript
  roles: ["ADMIN"],
  ```

- [ ] **Step 3: Run Typecheck**
  Run: `npm run type-check` (in powershell) to verify types match.

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add src/types/auth.types.ts src/services/auth.service.ts
  git commit -m "feat: add roles mapping to staff user profile"
  ```

---

### Task 2: Navbar UI Updates (Admin Header)

**Files:**
- Modify: `src/components/layout/admin/admin-header.tsx`

**Interfaces:**
- Consumes: Updated `user` profile containing `avatarUrl` and `roles`.
- Produces: Fully styled header displaying actual profile image and mapped Vietnamese role label.

- [ ] **Step 1: Update Admin Header Component**
  Replace profile avatar and role text rendering in `src/components/layout/admin/admin-header.tsx`. Add `getRoleLabel` helper.
  ```typescript
  import { Avatar } from "@/components/base/avatar/avatar";

  // Inside AdminHeader:
  const getRoleLabel = (roles?: string[], defaultRole?: string) => {
      if (!roles || roles.length === 0) {
          return defaultRole === "ADMIN" ? "Quản trị viên" : "Giảng viên";
      }
      if (roles.includes("ADMIN")) return "Quản trị viên";
      if (roles.includes("MANAGER")) return "Quản lý";
      if (roles.includes("TEACHER")) return "Giảng viên";
      if (roles.includes("TEACHER_ASSISTANT")) return "Trợ giảng";
      if (roles.includes("ASSISTANT")) return "Trợ lý";
      return "Nhân viên";
  };
  ```
  And render:
  ```tsx
  {/* User profile indicator */}
  <div className="flex items-center gap-2.5 rounded-full border border-line bg-white px-3 py-1 shadow-xs">
      <div className="text-right">
          <div className="font-bold text-[13px] leading-tight text-ink">
              {user?.fullName || "Rikkei Admin"}
          </div>
          <div className="text-[10.5px] font-medium text-muted">
              {getRoleLabel(user?.roles, user?.role)}
          </div>
      </div>
      <Avatar
          size="sm"
          src={user?.avatarUrl || undefined}
          initials={getInitials(user?.fullName)}
          alt={user?.fullName}
          className="bg-linear-to-br from-wine-bright to-wine text-white font-extrabold"
      />
  </div>
  ```

- [ ] **Step 2: Run Lint**
  Run: `npm run lint` to ensure no styles or imports are broken.

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add src/components/layout/admin/admin-header.tsx
  git commit -m "feat: render staff avatar and role dynamically in navbar"
  ```

---

### Task 3: API Client & Staff Service

**Files:**
- Create: `src/types/staff.types.ts`
- Create: `src/services/staff.service.ts`

**Interfaces:**
- Exposes CRUD functions for Staff entity and fetching of Systems.

- [ ] **Step 1: Create Staff Types**
  Create `src/types/staff.types.ts` defining:
  ```typescript
  export interface StaffRoleEmbed {
      name: string;
      weight: number;
  }

  export interface Staff {
      id: string;
      fullName: string;
      email: string;
      phone?: string;
      address?: string;
      avatar?: string | null;
      gender?: "MALE" | "FEMALE" | "OTHER";
      status: "ACTIVE" | "DISABLE";
      whitelist?: boolean;
      systemIds?: string[];
      roles: StaffRoleEmbed[];
      createdAt: string;
      updatedAt: string;
  }

  export interface System {
      id: string;
      systemCode: string;
      name: string;
      createdAt: string;
  }

  export interface CreateStaffRequest {
      fullName: string;
      email: string;
      phone: string;
      address: string;
      password?: string;
      avatar?: string;
      gender?: "MALE" | "FEMALE" | "OTHER";
      status?: "ACTIVE" | "DISABLE";
      whitelist?: boolean;
      systemIds?: string[];
      roles?: string[];
  }

  export interface UpdateStaffRequest extends Partial<CreateStaffRequest> {}
  ```

- [ ] **Step 2: Create Staff & Systems Service**
  Create `src/services/staff.service.ts` with API calls:
  ```typescript
  import { httpClient } from "@/lib/http-client";
  import { HttpMethod } from "@/types/api-types";
  import type { Staff, System, CreateStaffRequest, UpdateStaffRequest } from "@/types/staff.types";

  export async function getStaffList(): Promise<Staff[]> {
      return httpClient<Staff[]>("/staff", { method: HttpMethod.GET });
  }

  export async function createStaff(data: CreateStaffRequest): Promise<Staff> {
      return httpClient<Staff>("/staff", {
          method: HttpMethod.POST,
          body: JSON.stringify(data),
      });
  }

  export async function updateStaff(id: string, data: UpdateStaffRequest): Promise<Staff> {
      return httpClient<Staff>(`/staff/${id}`, {
          method: HttpMethod.PUT,
          body: JSON.stringify(data),
      });
  }

  export async function deleteStaff(id: string): Promise<void> {
      return httpClient<void>(`/staff/${id}`, { method: HttpMethod.DELETE });
  }

  export async function getSystemsList(): Promise<System[]> {
      return httpClient<System[]>("/systems", { method: HttpMethod.GET });
  }
  ```

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add src/types/staff.types.ts src/services/staff.service.ts
  git commit -m "feat: add types and service for staff CRUD and systems fetching"
  ```

---

### Task 4: Staff Forms & Zod Schemas

**Files:**
- Create: `src/schemas/staff.schema.ts`

**Interfaces:**
- Exposes `staffSchema` validating all form fields required when creating/editing staff.

- [ ] **Step 1: Create Validation Schemas**
  Create `src/schemas/staff.schema.ts` containing the validation schemas:
  ```typescript
  import { z } from "zod";

  export const staffSchema = z.object({
      fullName: z.string().min(1, "Họ và tên không được để trống"),
      email: z.string().email("Email không hợp lệ").min(1, "Email không được để trống"),
      phone: z.string().regex(/^\+?[0-9]{9,12}$/, "Số điện thoại không hợp lệ").min(1, "Số điện thoại không được để trống"),
      address: z.string().min(1, "Địa chỉ không được để trống"),
      password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").optional().or(z.literal("")),
      gender: z.enum(["MALE", "FEMALE", "OTHER"]),
      status: z.enum(["ACTIVE", "DISABLE"]),
      whitelist: z.boolean().default(false),
      systemIds: z.array(z.string()).default([]),
      roles: z.array(z.string()).min(1, "Chọn ít nhất 1 vai trò"),
  });

  export type StaffSchemaType = z.infer<typeof staffSchema>;
  ```

- [ ] **Step 2: Commit**
  Run:
  ```bash
  git add src/schemas/staff.schema.ts
  git commit -m "feat: add zod validation schema for staff management forms"
  ```

---

### Task 5: Staff Views & Modals (Slideouts)

**Files:**
- Create: `src/views/staff-list-view.tsx`
- Create: `src/views/staff-list-client-view.tsx`

**Interfaces:**
- Consumes: `useAuth()`, TanStack Query `useQuery` for fetching lists, `useMutation` for mutations.
- Produces: Beautiful, premium interface containing KPI metrics, filters, data table, and modal panels.

- [ ] **Step 1: Write Staff List Main View**
  Create `src/views/staff-list-view.tsx`.
  This implements:
  - Fetches staff list using `useQuery` and systems list using `useQuery`.
  - Implements KPI Metrics at the top:
    - Card 1: Total Staff (`staffs.length`)
    - Card 2: Teachers/TA (`staffs.filter(s => s.roles.some(r => r.name === 'TEACHER' || r.name === 'TEACHER_ASSISTANT')).length`)
    - Card 3: Active Staff (`staffs.filter(s => s.status === 'ACTIVE').length`)
    - Card 4: Admins (`staffs.filter(s => s.roles.some(r => r.name === 'ADMIN')).length`)
  - Implements search states and filters:
    - Search input.
    - Role filter select.
    - Status filter select.
  - Implements pre-built `<Table>` component:
    - Custom rows mapping roles to colored badges.
    - Custom rows mapping systemIds to systemCodes.
    - Actions column showing edit (pen) and delete/lock (trash/lock) icons.
  - CRUD operations:
    - Mutations for create, update, delete.
    - Dialog forms for Add and Edit Staff.

  *Snippet for rendering view structure:*
  Create `src/views/staff-list-view.tsx` with all the UI components. Since the file is large, make sure to write full logic without stubbing.

- [ ] **Step 2: Write Client Auth Check Wrapper**
  Create `src/views/staff-list-client-view.tsx`:
  ```typescript
  "use client";

  import { useEffect } from "react";
  import { AdminLayout } from "@/components/layout/admin/admin-layout";
  import { useAuth } from "@/hooks/use-auth";
  import { useAppRouter } from "@/hooks/use-app-router";
  import { StaffListView } from "./staff-list-view";

  export function StaffListClientView() {
      const { user, isLoading } = useAuth();
      const router = useAppRouter();

      useEffect(() => {
          if (!isLoading && !user) {
              router.replace("/login");
          }
      }, [user, isLoading, router]);

      if (isLoading) {
          return (
              <div className="flex min-h-screen items-center justify-center bg-cream">
                  <div className="flex flex-col items-center gap-4">
                      <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500" />
                  </div>
              </div>
          );
      }

      if (!user) {
          return null;
      }

      return (
          <AdminLayout title="Quản lý nhân viên" subtitle="Danh sách tài khoản quản trị hệ thống và giảng viên">
              <StaffListView />
          </AdminLayout>
      );
  }
  ```

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add src/views/staff-list-view.tsx src/views/staff-list-client-view.tsx
  git commit -m "feat: implement staff list view, KPI cards, table and modal panels"
  ```

---

### Task 6: Routing & Verification

**Files:**
- Create: `src/app/staff/page.tsx`

**Interfaces:**
- Maps `/staff` route to `StaffListClientView`.

- [ ] **Step 1: Create Route File**
  Create `src/app/staff/page.tsx`:
  ```typescript
  import type { Metadata } from "next";
  import { StaffListClientView } from "@/views/staff-list-client-view";

  export const metadata: Metadata = {
      title: "Quản lý nhân viên | LMS Portal",
      description: "Quản lý tài khoản cán bộ nhân viên, giảng viên và trợ giảng",
  };

  export default function StaffPage() {
      return <StaffListClientView />;
  }
  ```

- [ ] **Step 2: Run Verifications**
  Run: `npm run type-check`
  Run: `npm run lint`

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add src/app/staff/page.tsx
  git commit -m "feat: add staff route connecting staff view"
  ```
