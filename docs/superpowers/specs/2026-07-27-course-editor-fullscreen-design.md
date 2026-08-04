# Course Editor Fullscreen Layout Design

## Overview
Re-design the course detail editing page (`/type/[id]/[courseId]`) to hide the global `AdminSidebar` and `AdminHeader`, providing a distraction-free, full-screen workspace with a dedicated top header bar matching the target design.

## Target User Interface
1. **Fullscreen Canvas**:
   - `AdminLayout` supports `hideSidebarAndHeader?: boolean` (or `fullscreen?: boolean`).
   - When set to `true`, the layout hides `AdminSidebar` and `AdminHeader`, removing default padding and scrolling to let the view span 100vw x 100vh.

2. **Top Workspace Header Bar**:
   - Fixed / Sticky header at the top of the course workspace.
   - **Left section**:
     - Back button (`←` / `ArrowLeft`) navigating back to the course list (`/type/[id]`).
     - Course title (e.g., "ádasd") with inline edit icon (`Pencil` / `Edit`).
   - **Right section**:
     - "Xóa khóa học" button (Danger outline style with `Trash2` icon).
     - "Lưu thay đổi" button (Primary solid red/wine style with `Save` icon) which triggers the save action for the active lesson/session.

3. **Workspace Layout**:
   - Below the top header: 2-column flex/grid container occupying remaining height (`calc(100vh - headerHeight)`).
   - Left column (Course structure list):
     - "+ Thêm chương" button.
     - Sessions list & lesson nodes.
   - Right column (Content Editor panel):
     - Active lesson / session configuration form.

## Detailed Component Changes

### 1. `src/components/layout/admin/admin-layout.tsx`
- Add optional prop `hideSidebarAndHeader?: boolean`.
- When `hideSidebarAndHeader` is true:
  - Omit rendering `<AdminSidebar />` and `<AdminHeader />`.
  - Main container takes `w-full h-screen p-0 bg-slate-50`.

### 2. `src/views/type/type-detail-course-client-view.tsx`
- Pass `hideSidebarAndHeader={true}` to `<AdminLayout>`.

### 3. `src/views/type/type-detail-course-view.tsx`
- Implement top header bar:
  - Back navigation button to `/type/${id}`.
  - Display course title (fetched from course details or system/course query).
  - "Xóa khóa học" button with confirmation modal.
  - "Lưu thay đổi" button: connects to `LessonEditorWrapper` save ref or save handler.
- Remove redundant inline breadcrumbs and inner "Lưu bài học" button header inside `LessonEditorWrapper` to avoid duplicate save buttons.

### 4. `src/views/type/type-detail-course/components/lesson-editor-wrapper.tsx`
- Expose/register save trigger or receive `isSaving` and `onSave` from parent / header bar.

## Verification Plan
- Check `/type/[id]/[courseId]` page in browser to verify:
  - Sidebar and top header are hidden.
  - New top header bar renders correctly with back button, course title, delete course button, and save changes button.
  - Saving lesson content works via the top "Lưu thay đổi" button.
  - Navigating back via `←` returns to `/type/[id]`.
