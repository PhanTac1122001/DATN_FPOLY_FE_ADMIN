# Training Types E-Learning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the training types E-Learning page under route `/type` (both list and dynamic detail `/type/[id]`) with mock data, matching the staff listing page layout, with correct breadcrumbs and sorting/searching.

**Architecture:** A list page and a dynamic detail page under Next.js `src/app/type`. Uses React State for search/sort filtering and standard Tailwind + Lucide icons.

**Tech Stack:** React, Next.js (App Router), Lucide Icons, TailwindCSS.

## Global Constraints
- Exact path names and structures
- Avoid calling the API for now, use local mock data
- Giao diện phải giống với Staff page (border-slate-100, shadow-xs, background white, button style, table layout)

---

### Task 1: Create Mock Data and Update Sidebar Route

**Files:**
- Create: `lms-portal-admin/src/constants/type-mock.constants.ts`
- Modify: `lms-portal-admin/src/constants/admin-sidebar.constants.ts`

- [ ] **Step 1: Create `src/constants/type-mock.constants.ts`**

Define the training type data matching the requested images exactly:
```typescript
export interface SemesterMock {
    id: string;
    semesterName: string;
    badgeColor: "warning" | "orange" | "error" | "info" | "success";
}

export interface TrainingTypeMock {
    id: string;
    code: string;
    name: string;
    majors: string;
    createdAt: string;
    semesters: SemesterMock[];
}

export const TRAINING_TYPES_MOCK: TrainingTypeMock[] = [
    {
        id: "1",
        code: "PTIT-CNTT-K24",
        name: "K24 - Kỹ sư Công nghệ thông tin",
        majors: "Chuyên ngành chung",
        createdAt: "13/08/2024",
        semesters: [
            { id: "1", semesterName: "Hướng dẫn", badgeColor: "warning" },
            { id: "2", semesterName: "Kỳ III", badgeColor: "orange" },
            { id: "3", semesterName: "Kỳ IV", badgeColor: "error" },
            { id: "4", semesterName: "Kỳ I", badgeColor: "info" },
            { id: "5", semesterName: "Kỳ II", badgeColor: "success" }
        ]
    },
    {
        id: "2",
        code: "PTIT-CNTT-K23",
        name: "K23 - Kỹ sư Công nghệ thông tin",
        majors: "Chuyên ngành chung",
        createdAt: "16/10/2024",
        semesters: [
            { id: "1", semesterName: "Hướng dẫn", badgeColor: "warning" },
            { id: "2", semesterName: "Kỳ III", badgeColor: "orange" },
            { id: "3", semesterName: "Kỳ I", badgeColor: "info" },
            { id: "4", semesterName: "Kỳ II", badgeColor: "success" }
        ]
    },
    {
        id: "3",
        code: "DA-BK",
        name: "Data Analysis (Bách Khoa)",
        majors: "Khoa học dữ liệu, Phân tích kinh doanh",
        createdAt: "23/09/2025",
        semesters: [
            { id: "1", semesterName: "Kỳ I", badgeColor: "info" },
            { id: "2", semesterName: "Kỳ II", badgeColor: "success" }
        ]
    },
    {
        id: "4",
        code: "DAKB-PBI",
        name: "Hệ Phân tích dữ liệu Kinh doanh Power BI",
        majors: "Power BI, Excel Advanced",
        createdAt: "09/01/2026",
        semesters: [
            { id: "1", semesterName: "Kỳ I", badgeColor: "info" },
            { id: "2", semesterName: "Kỳ II", badgeColor: "success" }
        ]
    },
    {
        id: "5",
        code: "ES-DDT",
        name: "Embedded System (Điện-Điện Tử)",
        majors: "Hệ thống nhúng, Thiết kế vi mạch",
        createdAt: "26/01/2026",
        semesters: [
            { id: "1", semesterName: "Kỳ I", badgeColor: "info" },
            { id: "2", semesterName: "Kỳ II", badgeColor: "success" }
        ]
    },
    {
        id: "6",
        code: "JS-FS",
        name: "Fullstack Javascript - Huấn luyện IT thực chiến doanh nghiệp",
        majors: "Lập trình Web",
        createdAt: "04/03/2026",
        semesters: [
            { id: "1", semesterName: "Kỳ I", badgeColor: "info" },
            { id: "2", semesterName: "Kỳ II", badgeColor: "success" }
        ]
    },
    {
        id: "7",
        code: "BRSE-JPN",
        name: "Kỹ sư cầu nối – BrSE",
        majors: "Tiếng Nhật CNTT, Quản trị dự án...",
        createdAt: "10/04/2026",
        semesters: [
            { id: "1", semesterName: "Kỳ I", badgeColor: "info" },
            { id: "2", semesterName: "Kỳ II", badgeColor: "success" }
        ]
    },
    {
        id: "8",
        code: "BA-NEU",
        name: "Bussiness Analyst (NEU)",
        majors: "Phân tích nghiệp vụ",
        createdAt: "08/05/2026",
        semesters: [
            { id: "1", semesterName: "Kỳ I", badgeColor: "info" },
            { id: "2", semesterName: "Kỳ II", badgeColor: "success" }
        ]
    },
    {
        id: "9",
        code: "ST-AI",
        name: "Khóa học Software Testing Fullskill with AI",
        majors: "Kiểm thử phần mềm",
        createdAt: "11/05/2026",
        semesters: [
            { id: "1", semesterName: "Kỳ I", badgeColor: "info" },
            { id: "2", semesterName: "Kỳ II", badgeColor: "success" }
        ]
    }
];
```

- [ ] **Step 2: Update path for E-learning training system in `src/constants/admin-sidebar.constants.ts`**

Change the E-learning `Hệ đào tạo` path to `/type`:
```diff
export const elearningItems = [
-    { label: "Hệ đào tạo", icon: Bookmark, path: "/training-systems-el" },
+    { label: "Hệ đào tạo", icon: Bookmark, path: "/type" },
```

- [ ] **Step 3: Commit updates**
Run:
`git add src/constants/type-mock.constants.ts src/constants/admin-sidebar.constants.ts`
`git commit -m "feat: add mock data for training types and update sidebar path"`

---

### Task 2: Implement List View for Training Types

**Files:**
- Create: `lms-portal-admin/src/views/type-list-view.tsx`
- Create: `lms-portal-admin/src/app/type/page.tsx`

- [ ] **Step 1: Create `src/views/type-list-view.tsx`**

Build the list view containing search filter and table structure styled exactly like `staff-list-view.tsx`.
Use `<Eye />` icon from `lucide-react` for the Action column. Clicking it navigates to `/type/[id]`.

- [ ] **Step 2: Create `src/app/type/page.tsx`**

Create the Next.js page that wraps `TypeListView` in the `AdminLayout` and checks for authentication.

- [ ] **Step 3: Commit changes**
Run:
`git add src/views/type-list-view.tsx src/app/type/page.tsx`
`git commit -m "feat: implement list view for training types at /type"`

---

### Task 3: Implement Dynamic Detail View for Training Types

**Files:**
- Create: `lms-portal-admin/src/views/type-detail-view.tsx`
- Create: `lms-portal-admin/src/app/type/[id]/page.tsx`

- [ ] **Step 1: Create `src/views/type-detail-view.tsx`**

Build the detail view featuring:
- Breadcrumbs: `Quản lý E-Learning / Hệ đào tạo / Chi tiết`
- Info card header layout: three columns showing Code, Name, Created Date.
- Search input (`Tìm kiếm kỳ học...`) and `Sắp xếp` button.
- Semester table displaying ID, Hệ đào tạo, Chuyên ngành, Kỳ học (Badge with correct colors), and Action button `Danh sách môn học`.

- [ ] **Step 2: Create `src/app/type/[id]/page.tsx`**

Create the page component for `src/app/type/[id]/page.tsx` to read the `id` param and render `TypeDetailView`.

- [ ] **Step 3: Commit changes**
Run:
`git add src/views/type-detail-view.tsx src/app/type/[id]/page.tsx`
`git commit -m "feat: implement dynamic detail view for training types at /type/[id]"`
