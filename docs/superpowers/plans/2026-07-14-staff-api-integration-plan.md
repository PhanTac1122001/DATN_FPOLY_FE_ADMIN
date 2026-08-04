# Staff API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the API endpoint paths and unwrap the response data object in `staff.service.ts` to allow staff lists and systems to load correctly.

**Architecture:** Use the Next.js rewrite rules by routing calls through `/api/...` instead of root paths `/staff` or `/systems`, and bóc tách the `.data` payload returned by the NestJS global TransformInterceptor.

**Tech Stack:** Next.js, React Query, TypeScript

## Global Constraints

- No other service files (like `auth.service.ts` profile endpoints) should be modified in this task.
- Ensure type definitions (`Staff[]`, `System[]`, `Staff`, etc.) are preserved.

---

### Task 1: Update Service Endpoints and Unwrap Responses

**Files:**
- Modify: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\services\staff.service.ts`

**Interfaces:**
- Consumes: `httpClient` from `@/lib/http-client`, and the backend core API response wrappers.
- Produces: Corrected service functions `getStaffList`, `createStaff`, `updateStaff`, `deleteStaff`, `getSystemsList`.

- [ ] **Step 1: Modify staff.service.ts**
  Update [staff.service.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/services/staff.service.ts) to replace the endpoints and extract the `.data` property.

  ```typescript
  import { httpClient } from "@/lib/http-client";
  import { HttpMethod } from "@/types/api-types";
  import type { Staff, System, CreateStaffRequest, UpdateStaffRequest } from "@/types/staff.types";

  export async function getStaffList(): Promise<Staff[]> {
      const response = await httpClient<any>("/api/staff", { method: HttpMethod.GET });
      return response?.data || response || [];
  }

  export async function createStaff(data: CreateStaffRequest): Promise<Staff> {
      const response = await httpClient<any>("/api/staff", {
          method: HttpMethod.POST,
          body: JSON.stringify(data),
      });
      return response?.data || response;
  }

  export async function updateStaff(id: string, data: UpdateStaffRequest): Promise<Staff> {
      const response = await httpClient<any>(`/api/staff/${id}`, {
          method: HttpMethod.PUT,
          body: JSON.stringify(data),
      });
      return response?.data || response;
  }

  export async function deleteStaff(id: string): Promise<void> {
      const response = await httpClient<any>(`/api/staff/${id}`, { method: HttpMethod.DELETE });
      return response?.data || response;
  }

  export async function getSystemsList(): Promise<System[]> {
      const response = await httpClient<any>("/api/systems", { method: HttpMethod.GET });
      return response?.data || response || [];
  }
  ```

- [ ] **Step 2: Verify compilation and TypeScript validity**
  Run typescript compile check in the workspace.
  Run: `npm run type-check` (or equivalent `tsc --noEmit`) in `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin`.
  Expected output: Success with no type check errors in `staff.service.ts`.

- [ ] **Step 3: Commit changes**
  Add and commit the modified `staff.service.ts` file.
  ```bash
  git add src/services/staff.service.ts
  git commit -m "feat: correct staff and systems API endpoints and unwrap response data"
  ```
