# Course Editor Fullscreen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide the sidebar and top header on `/type/[id]/[courseId]`, replacing them with a dedicated full-width course editor top header bar with back navigation, course title, delete course button, and top "Lưu thay đổi" button.

**Architecture:** Extend `AdminLayout` with `hideSidebarAndHeader` prop. Render a custom top header bar in `TypeDetailCourseView` with Back arrow, Course Title, Delete Course, and Save Changes button. Connect the Save Changes button to the active lesson/session save logic.

**Tech Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide React icons, React Query.

## Global Constraints
- Preserve existing routing and auth checks.
- Keep standard layout intact for all other routes.
- Match aesthetics from Image 2 (clean header bar with back button, edit icon, action buttons).

---

### Task 1: Add `hideSidebarAndHeader` prop to `AdminLayout`

**Files:**
- Modify: `src/components/layout/admin/admin-layout.tsx`

**Interfaces:**
- Produces: `hideSidebarAndHeader?: boolean` prop on `AdminLayout`.

- [ ] **Step 1: Update `AdminLayout` component definition**
  Edit `src/components/layout/admin/admin-layout.tsx` to add `hideSidebarAndHeader` prop.

- [ ] **Step 2: Conditional rendering of Sidebar and Header**
  When `hideSidebarAndHeader` is true, omit `<AdminSidebar />` and `<AdminHeader />` and render full width container `w-full min-h-screen bg-cream`.

- [ ] **Step 3: Commit changes**
  `git commit -m "feat(layout): add hideSidebarAndHeader prop to AdminLayout"`

---

### Task 2: Enable full screen layout in `TypeDetailCourseClientView` and build top header bar in `TypeDetailCourseView`

**Files:**
- Modify: `src/views/type/type-detail-course-client-view.tsx`
- Modify: `src/views/type/type-detail-course-view.tsx`
- Modify: `src/views/type/type-detail-course/components/lesson-editor-wrapper.tsx`

**Interfaces:**
- Consumes: `hideSidebarAndHeader` on `AdminLayout`.
- Produces: Workspace top bar header in `TypeDetailCourseView` with "Lưu thay đổi" trigger.

- [ ] **Step 1: Update `TypeDetailCourseClientView` to pass `hideSidebarAndHeader={true}`**
  Pass `hideSidebarAndHeader={true}` to `<AdminLayout>` in `src/views/type/type-detail-course-client-view.tsx`.

- [ ] **Step 2: Add Top Header Bar to `TypeDetailCourseView`**
  Add top navigation bar in `src/views/type/type-detail-course-view.tsx` containing:
  - Back arrow `←` linking to `/type/${id}`.
  - Course name & edit icon `Pencil`.
  - "Xóa khóa học" button (Danger outline with `Trash2`).
  - "Lưu thay đổi" button (Solid wine/red with `Save` icon).

- [ ] **Step 3: Connect "Lưu thay đổi" button to `LessonEditorWrapper` save action**
  Pass `onSaveRef` / `saveTrigger` from `TypeDetailCourseView` to `LessonEditorWrapper` so clicking top bar "Lưu thay đổi" executes the lesson save function.

- [ ] **Step 4: Refine layout heights & spacing**
  Ensure main grid height is `h-[calc(100vh-64px)]` so it fits full viewport seamlessly.

- [ ] **Step 5: Commit changes**
  `git commit -m "feat(course-detail): implement top workspace header and fullscreen layout"`
