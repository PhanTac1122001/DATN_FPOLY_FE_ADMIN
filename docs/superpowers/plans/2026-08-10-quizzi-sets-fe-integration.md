# Quizzi Sets Frontend Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai giao diện Quản lý bộ đề Quizzi (`/quizzi-sets`) và kết nối các API backend Session Quiz trong `lms-portal-admin`.

**Architecture:** Tạo types, API service `session-quiz.service.ts`, modal component `CreateQuizziSetModal` (hỗ trợ cả tạo mới và cập nhật, TiptapEditor cho Rich Text câu hỏi, Excel Import/Template download, Session picker), list view `QuizziSetListView`, client view `QuizziSetClientView`, và Next.js page tại `src/app/quizzi-sets/page.tsx`.

**Tech Stack:** Next.js App Router, React, TypeScript, TailwindCSS, Lucide Icons, TiptapEditor.

---

### Task 1: Frontend Types, API Endpoints & Service

**Files:**
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\types\session-quiz.types.ts`
- Modify: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\constants\api-endpoints.constants.ts`
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\services\session-quiz.service.ts`

- [ ] **Step 1: Tạo `session-quiz.types.ts` chứa dữ liệu SessionQuizItem, Question, Option, Payloads**
- [ ] **Step 2: Cập nhật `api-endpoints.constants.ts` thêm `SESSION_QUIZ` endpoints**
- [ ] **Step 3: Tạo `session-quiz.service.ts` kết nối REST API `/staff/session-quizzes`**
- [ ] **Step 4: Run `npm run typecheck`**

---

### Task 2: Create & Edit Modal Component (`CreateQuizziSetModal`)

**Files:**
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\components\application\modals\create-quizzi-set-modal.tsx`

- [ ] **Step 1: Xây dựng bộ chọn Session (Hệ đào tạo dropdown, Môn học dropdown, Sessions Checkbox List)**
- [ ] **Step 2: Xây dựng các ô nhập Tiêu đề, Mô tả, Thời gian làm bài**
- [ ] **Step 3: Xây dựng chức năng Tải mẫu Excel & Import Excel**
- [ ] **Step 4: Xây dựng danh sách câu hỏi động (Nội dung với `TiptapEditor`, Loại câu hỏi, Điểm, Phân loại Pre-quiz, Độ khó)**
- [ ] **Step 5: Xây dựng các phương án đáp án (Radio/Checkbox, Nội dung, Giải thích tùy chọn)**
- [ ] **Step 6: Tích hợp xử lý Submit form (gọi `createSessionQuiz` hoặc `updateSessionQuiz`)**
- [ ] **Step 7: Run `npm run typecheck`**

---

### Task 3: Views & App Route Page

**Files:**
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\views\quizzi-sets\quizzi-set-list-view.tsx`
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\views\quizzi-sets\quizzi-set-client-view.tsx`
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\app\quizzi-sets\page.tsx`

- [ ] **Step 1: Tạo `quizzi-set-list-view.tsx` với thanh Search, Phân trang, Bảng danh sách và các nút thao tác Sửa/Xoá**
- [ ] **Step 2: Tạo `quizzi-set-client-view.tsx` bọc trong `AdminLayout`**
- [ ] **Step 3: Tạo `src/app/quizzi-sets/page.tsx` export mặc định component `QuizziSetClientView`**
- [ ] **Step 4: Run `npm run typecheck` & `npm run lint`**
