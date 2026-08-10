# Quản Lý Nhóm (Group Management) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai tính năng Quản lý nhóm học tập cho LMS Portal với các API backend NestJS (CRUD, lọc, quan hệ N-N với môn học, giao BTVN theo nhóm & theo cấp độ) và giao diện Admin Next.js.

**Architecture:** Backend tạo Mongoose schemas `Group` & `GroupHomeworkAssignment` trong `lms-portal-api`, xây dựng module `GroupModule` (Controller, Service, DTOs). Frontend `lms-portal-admin` xây dựng `GroupService`, `GroupModal`, `AssignGroupHomeworkModal` và tích hợp vào màn hình quản lý lớp học.

**Tech Stack:** NestJS, Mongoose, TypeScript, React 18, Next.js 15, React Query, Tailwind CSS.

## Global Constraints
- Backend Mongoose Models tuân thủ kế thừa `BaseDocument` và decorator `@nestjs/mongoose`.
- Endpoint API bắt đầu bằng `/v1/staff/groups`.
- Sinh viên gán vào nhóm phải thuộc danh sách sinh viên ghi danh trong `classId`.
- Cấp độ giao BTVN gồm 5 mức: `EASY` (Dễ), `MEDIUM` (Trung bình), `FAIR` (Khá), `GOOD` (Giỏi), `EXCELLENT` (Xuất sắc).

---

### Task 1: Backend Schemas & Database Layer (`lms-portal-api`)

**Files:**
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\shared\db\models\group.schema.ts`
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\shared\db\models\group-homework-assignment.schema.ts`
- Modify: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\shared\db\models\index.ts`

**Interfaces:**
- Produces: `Group`, `GroupSchema`, `GroupHomeworkAssignment`, `GroupHomeworkAssignmentSchema`, `HomeworkDifficultyLevel`

- [ ] **Step 1: Tạo `group.schema.ts`**
  Khai báo Mongoose schema cho `Group` với các trường `classId`, `title`, `description`, `subjectIds` (N-N), `studentIds`.

- [ ] **Step 2: Tạo `group-homework-assignment.schema.ts`**
  Khai báo enum `HomeworkDifficultyLevel` và Mongoose schema `GroupHomeworkAssignment`.

- [ ] **Step 3: Export schemas trong `index.ts`**
  Export `Group`, `GroupSchema`, `GroupHomeworkAssignment`, `GroupHomeworkAssignmentSchema` từ `src/shared/db/models/index.ts`.

- [ ] **Step 4: Commit Task 1**
  ```bash
  git add src/shared/db/models/group.schema.ts src/shared/db/models/group-homework-assignment.schema.ts src/shared/db/models/index.ts
  git commit -m "feat(api): add Group and GroupHomeworkAssignment Mongoose schemas"
  ```

---

### Task 2: Backend Group DTOs & Entities (`lms-portal-api`)

**Files:**
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\group\entities\group.entity.ts`
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\group\dto\create-group.dto.ts`
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\group\dto\update-group.dto.ts`
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\group\dto\assign-group-homework.dto.ts`
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\group\dto\filter-group.dto.ts`

**Interfaces:**
- Consumes: Mongoose Models `Group`, `GroupHomeworkAssignment`
- Produces: `GroupEntity`, `CreateGroupDto`, `UpdateGroupDto`, `AssignGroupHomeworkDto`, `FilterGroupDto`

- [ ] **Step 1: Tạo DTOs và Entity trong `src/modules/group/`**
  Tạo `CreateGroupDto`, `UpdateGroupDto`, `AssignGroupHomeworkDto`, `FilterGroupDto` sử dụng `class-validator` và `swagger`.

- [ ] **Step 2: Commit Task 2**
  ```bash
  git add src/modules/group/
  git commit -m "feat(api): add DTOs and entities for group management"
  ```

---

### Task 3: Backend Group Service & Controller (`lms-portal-api`)

**Files:**
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\group\group.service.ts`
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\group\group.staff.controller.ts`
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\group\group.module.ts`
- Modify: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\app.module.ts`

**Interfaces:**
- Consumes: `Group`, `GroupHomeworkAssignment`, DTOs
- Produces: REST Endpoints under `/v1/staff/groups`

- [ ] **Step 1: Xây dựng `GroupService`**
  Viết logic `create`, `findAll` (lọc theo classId, subjectId, search), `findOne`, `update`, `remove`, `assignHomework`, `getHomeworkAssignments`, `getStudentsInClass`.

- [ ] **Step 2: Xây dựng `GroupStaffController`**
  Khai báo Swagger và các router HTTP endpoints: `POST /`, `GET /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `POST /:id/assign-homework`, `GET /:id/homework-assignments`.

- [ ] **Step 3: Khai báo `GroupModule` và import vào `AppModule`**

- [ ] **Step 4: Commit Task 3**
  ```bash
  git add src/modules/group/ src/app.module.ts
  git commit -m "feat(api): implement GroupService and GroupStaffController"
  ```

---

### Task 4: Frontend Types & API Service (`lms-portal-admin`)

**Files:**
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\types\group.types.ts`
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\services\group.service.ts`

**Interfaces:**
- Produces: `Group`, `CreateGroupRequest`, `UpdateGroupRequest`, `AssignGroupHomeworkRequest`, `groupService`

- [ ] **Step 1: Khai báo TypeScript types `group.types.ts`**
  Định nghĩa các interface `Group`, `GroupHomeworkAssignment`, `CreateGroupRequest`, `UpdateGroupRequest`, `AssignGroupHomeworkRequest`.

- [ ] **Step 2: Viết `group.service.ts`**
  Kết nối HTTP client (Axios) đến `/v1/staff/groups`.

- [ ] **Step 3: Commit Task 4**
  ```bash
  git add src/types/group.types.ts src/services/group.service.ts
  git commit -m "feat(admin): add group types and API service"
  ```

---

### Task 5: Frontend UI Modals & Tab View (`lms-portal-admin`)

**Files:**
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\components\application\modals\group-modal.tsx`
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\components\application\modals\assign-group-homework-modal.tsx`
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\views\classes\tabs\class-groups-tab.tsx`
- Modify: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\views\classes\class-detail-view.tsx`

**Interfaces:**
- Consumes: `groupService`, `ClassDetail`
- Produces: `GroupModal`, `AssignGroupHomeworkModal`, `ClassGroupsTab` UI components

- [ ] **Step 1: Tạo `GroupModal`**
  Modal React Hook Form + Zod tạo/chỉnh sửa nhóm (nhập tiêu đề, chọn môn học N-N, chọn sinh viên).

- [ ] **Step 2: Tạo `AssignGroupHomeworkModal`**
  Modal giao BTVN theo nhóm phân loại 5 cấp độ khó (Dễ, TB, Khá, Giỏi, Xuất sắc).

- [ ] **Step 3: Tạo `ClassGroupsTab` và tích hợp vào `class-detail-view.tsx`**

- [ ] **Step 4: Commit Task 5**
  ```bash
  git add src/components/application/modals/ src/views/classes/
  git commit -m "feat(admin): add GroupModal, AssignGroupHomeworkModal and ClassGroupsTab"
  ```
