# Exams Sets E-Learning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the E-learning exam sets page under route `/exams-sets-el` (both list and dynamic detail `/exams-sets-el/[id]`) with mock data, matching the staff listing page layout, with correct breadcrumbs and sorting/searching of questions.

**Architecture:** A list page and a dynamic detail page under Next.js `src/app/exams-sets-el`. Uses React State for search/sort filtering and standard Tailwind + Lucide icons.

**Tech Stack:** React, Next.js (App Router), Lucide Icons, TailwindCSS.

## Global Constraints
- Exact path names and structures
- Avoid calling the API for now, use local mock data
- Giao diện phải giống với Staff page (border-slate-100, shadow-xs, background white, button style, table layout)
- No hardcoded strings in Views; all Vietnamese copy must be localized in `src/constants/ui-text.constants.ts`.

---

### Task 1: Declare Types, Create Mock Data and Update UI_TEXT

**Files:**
- Create: `lms-portal-admin/src/types/exam-set.types.ts`
- Create: `lms-portal-admin/src/constants/exam-set-mock.constants.ts`
- Modify: `lms-portal-admin/src/constants/ui-text.constants.ts`

- [ ] **Step 1: Create `src/types/exam-set.types.ts`**

Define interface for mock exam sets, questions, and page/view props:
```typescript
export interface OptionMock {
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
}

export interface QuestionMock {
    id: string;
    text: string;
    explanation: string;
    points: number;
    options: OptionMock[];
}

export interface ExamSetMock {
    id: string; // E.g., 'ASM-0001'
    name: string; // E.g., 'FastAPI - Session10 - Lesson 05'
    questionCount: number;
    createdAt: string; // E.g., '02/07/2026'
    questions: QuestionMock[];
}

export interface ExamSetListViewProps {}

export interface ExamSetDetailViewProps {
    id: string;
}

export interface ExamSetDetailClientViewProps {
    id: string;
}
```

- [ ] **Step 2: Create `src/constants/exam-set-mock.constants.ts`**

Populate 10 mock entries exactly matching the screenshot data:
```typescript
import type { ExamSetMock } from "@/types/exam-set.types";

export const EXAM_SETS_MOCK: ExamSetMock[] = [
    {
        id: "ASM-0001",
        name: "FastAPI - Session10 - Lesson 05",
        questionCount: 15,
        createdAt: "02/07/2026",
        questions: [
            {
                id: "q1",
                text: "Giao thức mặc định của FastAPI là gì?",
                explanation: "Chọn giao thức truyền tải được FastAPI hỗ trợ tối ưu và mặc định khi chạy ứng dụng.",
                points: 10,
                options: [
                    { id: "o1", label: "A", text: "HTTP/1.1 và HTTP/2 qua ASGI", isCorrect: true },
                    { id: "o2", label: "B", text: "WSGI mặc định", isCorrect: false },
                    { id: "o3", label: "C", text: "Chỉ hỗ trợ FTP", isCorrect: false }
                ]
            },
            {
                id: "q2",
                text: "Thư viện ORM nào thường dùng nhất với FastAPI?",
                explanation: "Thư viện ORM phổ biến giúp kết nối cơ sở dữ liệu trong FastAPI.",
                points: 10,
                options: [
                    { id: "o4", label: "A", text: "SQLAlchemy", isCorrect: true },
                    { id: "o5", label: "B", text: "Django ORM", isCorrect: false },
                    { id: "o6", label: "C", text: "Prisma", isCorrect: false }
                ]
            }
        ]
    },
    {
        id: "ASM-0002",
        name: "FastAPI - Session10 - Lesson 04",
        questionCount: 12,
        createdAt: "02/07/2026",
        questions: []
    },
    {
        id: "ASM-0003",
        name: "FastAPI - Session10 - Lesson 03",
        questionCount: 10,
        createdAt: "02/07/2026",
        questions: []
    },
    {
        id: "ASM-0004",
        name: "FastAPI - Session10 - Lesson 02",
        questionCount: 15,
        createdAt: "02/07/2026",
        questions: []
    },
    {
        id: "ASM-0005",
        name: "Backend Fullskill Devops - SS7 LS5 (fixed)",
        questionCount: 5,
        createdAt: "02/07/2026",
        questions: []
    },
    {
        id: "ASM-0006",
        name: "Backend Fullskill Devops - SS7 LS4 (fixed)",
        questionCount: 8,
        createdAt: "02/07/2026",
        questions: []
    },
    {
        id: "ASM-0007",
        name: "Backend Fullskill Devops - SS7 LS3 (fixed)",
        questionCount: 7,
        createdAt: "02/07/2026",
        questions: []
    },
    {
        id: "ASM-0008",
        name: "Backend Fullskill Devops - SS7 LS2 (fixed)",
        questionCount: 9,
        createdAt: "02/07/2026",
        questions: []
    },
    {
        id: "ASM-0009",
        name: "Backend Fullskill Devops - SS7 LS1 (fixed)",
        questionCount: 10,
        createdAt: "02/07/2026",
        questions: []
    },
    {
        id: "ASM-0010",
        name: "FastAPI - Session10 - Lesson 01",
        questionCount: 15,
        createdAt: "30/06/2026",
        questions: []
    }
];
```

- [ ] **Step 3: Update `src/constants/ui-text.constants.ts`**

Add text translations for `examsSetsEl` key inside `UI_TEXT` to resolve lint restrictions:
```typescript
    examsSetsEl: {
        title: "Quản lý Bộ đề trắc nghiệm",
        subtitle: "Danh sách bộ đề trắc nghiệm trong hệ thống E-learning",
        searchPlaceholder: "Tìm kiếm tên bộ đề...",
        noData: "Không tìm thấy bộ đề nào",
        thStt: "STT",
        thName: "Tên bộ đề",
        thCreatedAt: "Thời gian tạo",
        thActions: "Chức năng",
        viewDetails: "Xem chi tiết",
        editSet: "Sửa bộ đề",
        deleteSet: "Xóa bộ đề",
        questionsCountSuffix: " câu hỏi",
        breadcrumbParent: "Quản lý E-Learning",
        breadcrumbTitle: "Bộ đề trắc nghiệm",
        breadcrumbDetail: "Chi tiết",
        labelName: "Tên bộ đề",
        labelCode: "Mã bộ đề",
        labelCreatedAt: "Thời gian tạo",
        labelQuestionCount: "Số câu hỏi",
        tabQuiz: "Soạn câu hỏi Trắc nghiệm",
        tabEssay: "Soạn bài Tự luận",
        questionsHeader: "Danh sách câu hỏi trắc nghiệm",
        btnCreateQuestion: "Tạo câu hỏi mới",
        pointsSuffix: " điểm",
        essayMockContent: "Giao diện soạn bài tự luận của bộ đề"
    },
```

- [ ] **Step 4: Commit Task 1 changes**
Run:
`git add src/types/exam-set.types.ts src/constants/exam-set-mock.constants.ts src/constants/ui-text.constants.ts`
`git commit -m "feat: declare types and mock data for E-learning exam sets"`

---

### Task 2: Implement List View for Exam Sets

**Files:**
- Create: `lms-portal-admin/src/views/exam-set-list-view.tsx`
- Create: `lms-portal-admin/src/views/exam-set-client-view.tsx`
- Create: `lms-portal-admin/src/app/exams-sets-el/page.tsx`

- [ ] **Step 1: Create `src/views/exam-set-list-view.tsx`**

Build the list table matching the image layout:
- Folders icon before `name` in the row. Small sub-caption `ID: ASM-XXXX | XX câu hỏi`.
- Calendar icon next to the creation date.
- Three action buttons:
  1. Green eye button (View detail page)
  2. Blue edit button
  3. Red delete/trash button
Ensure everything uses `UI_TEXT.examsSetsEl` constants.

- [ ] **Step 2: Create `src/views/exam-set-client-view.tsx`**

Add auth-guard checking and wrapping list in `AdminLayout`.

- [ ] **Step 3: Create `src/app/exams-sets-el/page.tsx`**

Set metadata and return client view.

- [ ] **Step 4: Commit Task 2 changes**
Run:
`git add src/views/exam-set-list-view.tsx src/views/exam-set-client-view.tsx src/app/exams-sets-el/page.tsx`
`git commit -m "feat: implement list view for E-learning exam sets at /exams-sets-el"`

---

### Task 3: Implement Detail View for Exam Sets

**Files:**
- Create: `lms-portal-admin/src/views/exam-set-detail-view.tsx`
- Create: `lms-portal-admin/src/views/exam-set-detail-client-view.tsx`
- Create: `lms-portal-admin/src/app/exams-sets-el/[id]/page.tsx`

- [ ] **Step 1: Create `src/views/exam-set-detail-view.tsx`**

Build the details page showing:
- Info Card header layout (Tên bộ đề, Mã bộ đề, Thời gian tạo, Số câu hỏi) with colored background circles for icons.
- Tabs switcher (`Soạn câu hỏi Trắc nghiệm` / `Soạn bài Tự luận`).
- Questions list display:
  - Correct choice highlighted in green border and check icon.
  - Explanation block in light-gray box.
  - Points badge on the right of question title.
  - Interactive "Tạo câu hỏi mới", "Sửa", and "Xóa" buttons.

- [ ] **Step 2: Create `src/views/exam-set-detail-client-view.tsx`**

Auth checks & wrappers.

- [ ] **Step 3: Create `src/app/exams-sets-el/[id]/page.tsx`**

Dynamic page route param parsing.

- [ ] **Step 4: Commit Task 3 changes**
Run:
`git add src/views/exam-set-detail-view.tsx src/views/exam-set-detail-client-view.tsx src/app/exams-sets-el/[id]/page.tsx`
`git commit -m "feat: implement dynamic details view for E-learning exam sets"`
