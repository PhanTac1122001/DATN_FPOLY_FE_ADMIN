# Class Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai trang Quản lý Lớp học (`/classes`) bao gồm API service, types, schema, modal tạo/sửa lớp, modal chi tiết lớp, và bảng danh sách lớp theo đúng cấu trúc của trang Quản lý Nhân viên (`/staff`).

**Architecture:** Sử dụng Next.js Client Components bọc trong `AdminLayout`, TanStack Query (`useQuery`, `useMutation`), React Hook Form + Zod, Tailwind CSS, Lucide Icons, và `httpClient`.

**Tech Stack:** React 19, Next.js 15, TypeScript, TanStack Query v5, Zod, TailwindCSS, React-Aria.

---

### Task 1: Create Types, Schemas, and Constants for Class Management

**Files:**
- Create: `src/types/class.types.ts`
- Create: `src/schemas/class.schema.ts`
- Create: `src/constants/class.constants.ts`
- Modify: `src/constants/ui-text.constants.ts`

- [ ] **Step 1: Create `src/types/class.types.ts`**
- [ ] **Step 2: Create `src/schemas/class.schema.ts`**
- [ ] **Step 3: Create `src/constants/class.constants.ts`**
- [ ] **Step 4: Update `src/constants/ui-text.constants.ts` with `UI_TEXT.classes`**

### Task 2: Create Class Service Integration

**Files:**
- Create: `src/services/class.service.ts`

- [ ] **Step 1: Implement `getClassList`, `getClassById`, `getClassDetail`, `createClass`, `updateClass`, `deleteClass` using `httpClient`**

### Task 3: Create Modals for Class Management

**Files:**
- Create: `src/components/application/modals/class-modal.tsx`
- Create: `src/components/application/modals/class-detail-modal.tsx`

- [ ] **Step 1: Create `ClassModal` using `react-hook-form` + `zodResolver(classSchema)`**
- [ ] **Step 2: Create `ClassDetailModal` displaying class details, assigned courses, and enrolled student roster**

### Task 4: Create Views for Classes Page

**Files:**
- Create: `src/views/classes/classes-list-view.tsx`
- Create: `src/views/classes/classes-client-view.tsx`
- Modify: `src/app/classes/page.tsx`

- [ ] **Step 1: Create `ClassesListView` featuring search, filtering, class table, edit/delete/detail handlers**
- [ ] **Step 2: Create `ClassesClientView` with authentication check and `AdminLayout` wrapper**
- [ ] **Step 3: Ensure `src/app/classes/page.tsx` renders `ClassesClientView`**

### Task 5: Verification & Testing

- [ ] **Step 1: Run TypeScript compiler check `npx tsc --noEmit`**
- [ ] **Step 2: Verify `/classes` page renders cleanly without runtime errors**
