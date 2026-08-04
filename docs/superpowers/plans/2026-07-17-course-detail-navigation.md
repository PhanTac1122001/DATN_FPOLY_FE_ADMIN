# Course Detail Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a detailed "View Details" button (using the Lucide `Eye` icon) in the courses table on the training system details page (`/type/[id]`) that routes to the `/courses` curriculum page. The `/courses` page will read these query parameters to auto-select the system, course, and auto-expand the first session.

**Architecture:** 
- Add an eye icon button in the courses list table (`type-detail-view.tsx`).
- Update `/courses` route layout view (`courses-client-view.tsx`) to wrap the `CoursesView` in a `<Suspense>` boundary.
- Integrate Next.js's `useSearchParams` hook in `CoursesView` (`courses-view.tsx`) to read selection params (`systemId`, `courseId`), update state, and trigger automatic session expansion on load.

**Tech Stack:** Next.js (App Router), React, React Query, Tailwind CSS, Lucide Icons

## Global Constraints
- Keep lines short in markdown checklists.
- Wrap search parameter hook calls in a React Suspense boundary.
- Run type-check and lint to verify correctness.

---

### Task 1: Update type-detail-view.tsx to add Actions column and Eye button

**Files:**
- Modify: [type-detail-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/type-detail-view.tsx)

**Interfaces:**
- Consumes: `UI_TEXT.staff.thActions` ("Hành động") from `ui-text.constants.ts`.
- Produces: Navigation to `/courses?systemId=${detail.system.id}&courseId=${course.id}` via Next.js `Link`.

- [ ] **Step 1: Add Eye icon to imports**
  Modify line 6 to import `Eye` from `lucide-react`:
  ```typescript
  import { ArrowUpDown, ChevronRight, Search, Eye } from "lucide-react";
  ```

- [ ] **Step 2: Add Actions header column**
  Add a new `<th>` for Actions in the `thead` element, and increase `colSpan` of the empty state row to `6` to match.
  Around line 155:
  ```tsx
  <th className="px-6 py-4">{UI_TEXT.trainingTypesEl.thDescription}</th>
  <th className="w-24 px-6 py-4 text-center">{UI_TEXT.staff.thActions}</th>
  ```
  Empty state colSpan:
  ```tsx
  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
  ```

- [ ] **Step 3: Add Eye icon Link in course row**
  Add a `<td>` under the Description cell. The link should point to `/courses?systemId=${detail.system.id}&courseId=${course.id}` as a typed Route.
  ```tsx
  <td className="border-b border-slate-100 px-6 py-5.5 text-center">
      <Link
          href={`/courses?systemId=${detail.system.id}&courseId=${course.id}` as Route}
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-wine hover:text-wine hover:bg-wine/5 shadow-xxs cursor-pointer"
          title="Xem chi tiết học liệu"
      >
          <Eye className="size-4" />
      </Link>
  </td>
  ```

- [ ] **Step 4: Run type-check to verify types**
  Run: `npm run type-check`
  Expected: Clean compilation without errors.

- [ ] **Step 5: Commit changes**
  Run:
  ```bash
  git add src/views/type-detail-view.tsx
  git commit -m "feat: add eye button in training system detail view to go to course detail"
  ```

---

### Task 2: Wrap CoursesView with Suspense in courses-client-view.tsx

**Files:**
- Modify: [courses-client-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/courses-client-view.tsx)

**Interfaces:**
- Consumes: `<CoursesView />` component.
- Produces: Suspense-wrapped `CoursesView`.

- [ ] **Step 1: Import Suspense from React**
  Add `Suspense` to imports from `"react"`.
  ```typescript
  import { useEffect, Suspense } from "react";
  ```

- [ ] **Step 2: Wrap CoursesView in Suspense**
  Modify lines 30-34 to wrap `<CoursesView />` with `<Suspense>` and a loading fallback:
  ```tsx
  return (
      <AdminLayout title="Quản lý Học liệu" subtitle="Cấu hình chương trình học, buổi học, bài học và đính kèm học liệu">
          <Suspense fallback={
              <div className="flex h-[300px] items-center justify-center">
                  <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
              </div>
          }>
              <CoursesView />
          </Suspense>
      </AdminLayout>
  );
  ```

- [ ] **Step 3: Run lint to verify styles**
  Run: `npm run lint`
  Expected: No linting issues.

- [ ] **Step 4: Commit changes**
  Run:
  ```bash
  git add src/views/courses-client-view.tsx
  git commit -m "refactor: wrap CoursesView in Suspense boundary"
  ```

---

### Task 3: Support Query Parameter Sync and Auto-Expand in courses-view.tsx

**Files:**
- Modify: [courses-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/courses-view.tsx)

**Interfaces:**
- Consumes: URL query parameters `systemId` and `courseId`.
- Produces: Auto-selection of system, course, and auto-expanding the first session.

- [ ] **Step 1: Import useSearchParams and useEffect**
  Import `useEffect` from `"react"`.
  Import `useSearchParams` from `"next/navigation"`.
  Import `useAppRouter` from `@/hooks/use-app-router`.
  ```typescript
  import { useState, useEffect } from "react";
  import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  import { useSearchParams } from "next/navigation";
  import { useAppRouter } from "@/hooks/use-app-router";
  ```

- [ ] **Step 2: Read query parameters and initialize states**
  Use `useSearchParams` to extract query parameters and pass them as initial values to system/course ID state.
  ```typescript
  const searchParams = useSearchParams();
  const router = useAppRouter();

  const systemIdParam = searchParams.get("systemId") || "";
  const courseIdParam = searchParams.get("courseId") || "";

  const [selectedSystemId, setSelectedSystemId] = useState(systemIdParam);
  const [selectedCourseId, setSelectedCourseId] = useState(courseIdParam);
  const [expandedSessionId, setExpandedSessionId] = useState("");
  ```

- [ ] **Step 3: Add useEffects to sync query parameters to states**
  Add effects to update the states when URL query parameters change.
  ```typescript
  useEffect(() => {
      if (systemIdParam && systemIdParam !== selectedSystemId) {
          setSelectedSystemId(systemIdParam);
      }
  }, [systemIdParam]);

  useEffect(() => {
      if (courseIdParam && courseIdParam !== selectedCourseId) {
          setSelectedCourseId(courseIdParam);
      }
  }, [courseIdParam]);
  ```

- [ ] **Step 4: Update URL parameters when changing selection manually**
  Modify sidebar event handlers to update query parameters in the URL:
  ```typescript
  const handleSystemChange = (systemId: string) => {
      setSelectedSystemId(systemId);
      setSelectedCourseId("");
      const params = new URLSearchParams(window.location.search);
      if (systemId) {
          params.set("systemId", systemId);
      } else {
          params.delete("systemId");
      }
      params.delete("courseId");
      router.replace(`/courses?${params.toString()}`);
  };

  const handleCourseChange = (courseId: string) => {
      setSelectedCourseId(courseId);
      const params = new URLSearchParams(window.location.search);
      if (courseId) {
          params.set("courseId", courseId);
      } else {
          params.delete("courseId");
      }
      router.replace(`/courses?${params.toString()}`);
  };
  ```
  Update dropdown & button handlers to call these functions:
  ```tsx
  // select element on line 60:
  onChange={(e) => handleSystemChange(e.target.value)}
  ```
  ```tsx
  // button element on line 80:
  onClick={() => handleCourseChange(c.id)}
  ```

- [ ] **Step 5: Auto-expand the first session**
  Add an effect to automatically set `expandedSessionId` to the first session ID when `sessions` are fetched and loaded:
  ```typescript
  useEffect(() => {
      if (sessions.length > 0 && !expandedSessionId) {
          setExpandedSessionId(sessions[0].id);
      }
  }, [sessions, expandedSessionId]);
  ```

- [ ] **Step 6: Run verification commands**
  Run: `npm run type-check` and `npm run lint`
  Expected: Clean compilation, no styling issues.

- [ ] **Step 7: Commit changes**
  Run:
  ```bash
  git add src/views/courses-view.tsx
  git commit -m "feat: sync course select states to search query parameters and auto expand first session"
  ```

---

## Verification Plan

### Automated Checks
- `npm run type-check`
- `npm run lint`

### Manual Verification
1. Navigate to training system details `/type/[systemId]`.
2. Click the `Eye` icon for a course.
3. Verify redirection to `/courses?systemId=[systemId]&courseId=[courseId]`.
4. Verify correct System and Course selections are pre-loaded in the sidebar.
5. Verify the sessions list is visible, and the first Session is auto-expanded.
