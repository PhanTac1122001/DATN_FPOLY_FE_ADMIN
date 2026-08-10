# Quiz Creation API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tích hợp API Quản lý & Tạo Bộ Đề Trắc Nghiệm (Quiz) từ `lms-portal-api` vào trang `/exams-sets-el` của `lms-portal-admin`, hỗ trợ danh sách, tạo mới, chỉnh sửa chi tiết (câu hỏi) và xóa bộ đề.

**Architecture:** Tạo `quiz.service.ts` sử dụng `httpClient` để tương tác với backend REST API `/api/staff/quizzes`. Sử dụng mapper functions chuyển đổi giữa dữ liệu DTO backend (`QuizBackendEntity`, `QuizQuestionDto`) và UI components (`ExamSetMock`, `QuestionMock`).

**Tech Stack:** Next.js (App Router), TypeScript, React, `httpClient`, Lucide React icons, TailwindCSS.

## Global Constraints
- Target workspace: `lms-portal-admin`
- Base API Endpoint: `/api/staff/quizzes`
- Authorization: Đã tự động gắn qua Bearer token trong `httpClient`

---

### Task 1: API Endpoints & Quiz Types/Mappers

**Files:**
- Modify: `src/constants/api-endpoints.constants.ts`
- Create: `src/types/quiz.types.ts`

**Interfaces:**
- Consumes: `API_PREFIX` from `src/constants/api-endpoints.constants.ts`
- Produces: Backend DTOs (`QuizBackendEntity`, `QuizQuestionDto`, `QuizOptionDto`, `CreateQuizPayload`, `UpdateQuizPayload`), UI Mappers (`mapBackendQuizToExamSet`, `mapUiQuestionsToBackendDtos`).

- [ ] **Step 1: Update API Endpoints Constants**
  Modify `src/constants/api-endpoints.constants.ts` to add:
  ```ts
  QUIZ: {
      BASE: `${API_PREFIX}/staff/quizzes`,
      BY_ID: (id: string) => `${API_PREFIX}/staff/quizzes/${id}`,
  },
  ```

- [ ] **Step 2: Create `src/types/quiz.types.ts`**
  Define DTO types and helper mappers for transforming backend responses to UI objects.

  ```ts
  import type { ExamSetMock, QuestionMock, OptionMock } from "./exam-set.types";

  export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";

  export interface QuizOptionDto {
      content: string;
      isCorrect: boolean;
  }

  export interface QuizQuestionDto {
      content: string;
      type: QuestionType;
      points?: number;
      options?: QuizOptionDto[];
      timeInVideo?: number;
  }

  export interface QuizBackendEntity {
      id: string;
      title: string;
      description?: string;
      passThreshold: number;
      courseId?: string;
      questions: Array<{
          _id?: string;
          content: string;
          type: QuestionType;
          points?: number;
          timeInVideo?: number;
          options?: Array<{
              _id?: string;
              content: string;
              isCorrect?: boolean;
          }>;
      }>;
      createdAt: string;
  }

  export interface CreateQuizPayload {
      title: string;
      description?: string;
      passThreshold?: number;
      courseId?: string;
      questions: QuizQuestionDto[];
  }

  export interface UpdateQuizPayload {
      title?: string;
      description?: string;
      passThreshold?: number;
      courseId?: string;
      questions?: QuizQuestionDto[];
  }

  export function mapBackendQuizToExamSet(quiz: QuizBackendEntity): ExamSetMock {
      const questions: QuestionMock[] = (quiz.questions || []).map((q, qIndex) => {
          const isMulti = q.type === "MULTIPLE_CHOICE";
          const rawOptions = q.options || [];
          const options: OptionMock[] = rawOptions.map((opt, optIndex) => ({
              id: opt._id || `opt_${optIndex}`,
              label: String.fromCharCode(65 + optIndex), // A, B, C, D
              text: opt.content,
              isCorrect: Boolean(opt.isCorrect),
          }));

          return {
              id: q._id || `q_${qIndex}`,
              text: q.content,
              explanation: q.content,
              points: q.points || 10,
              options,
          };
      });

      return {
          id: quiz.id,
          name: quiz.title,
          questionCount: questions.length,
          createdAt: quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN"),
          questions,
      };
  }

  export function mapUiQuestionsToBackendDtos(questions: QuestionMock[]): QuizQuestionDto[] {
      return questions.map((q) => {
          const correctCount = (q.options || []).filter((o) => o.isCorrect).length;
          let type: QuestionType = "SINGLE_CHOICE";
          if (correctCount > 1) {
              type = "MULTIPLE_CHOICE";
          } else if (!q.options || q.options.length === 0) {
              type = "TEXT";
          }

          const options: QuizOptionDto[] = (q.options || [])
              .filter((o) => o.text && o.text.trim() !== "")
              .map((o) => ({
                  content: o.text,
                  isCorrect: o.isCorrect,
              }));

          return {
              content: q.explanation || q.text,
              type,
              points: q.points || 10,
              options: options.length > 0 ? options : undefined,
          };
      });
  }
  ```

---

### Task 2: Implement `quiz.service.ts`

**Files:**
- Create: `src/services/quiz.service.ts`

**Interfaces:**
- Consumes: `httpClient` from `src/lib/http-client`, `API_ENDPOINTS.QUIZ` from `src/constants/api-endpoints.constants.ts`
- Produces: `getQuizzes`, `getQuizById`, `createQuiz`, `updateQuiz`, `deleteQuiz`

- [ ] **Step 1: Create `src/services/quiz.service.ts`**
  ```ts
  import { API_ENDPOINTS } from "@/constants/api-endpoints.constants";
  import { httpClient } from "@/lib/http-client";
  import { HttpMethod } from "@/types/api-types";
  import type { CreateQuizPayload, QuizBackendEntity, UpdateQuizPayload } from "@/types/quiz.types";

  export async function getQuizzes(courseId?: string): Promise<QuizBackendEntity[]> {
      const url = courseId ? `${API_ENDPOINTS.QUIZ.BASE}?courseId=${courseId}` : API_ENDPOINTS.QUIZ.BASE;
      const res = await httpClient<any>(url, { method: HttpMethod.GET });
      return res.data || res || [];
  }

  export async function getQuizById(id: string): Promise<QuizBackendEntity> {
      const res = await httpClient<any>(API_ENDPOINTS.QUIZ.BY_ID(id), { method: HttpMethod.GET });
      return res.data || res;
  }

  export async function createQuiz(payload: CreateQuizPayload): Promise<QuizBackendEntity> {
      const res = await httpClient<any>(API_ENDPOINTS.QUIZ.BASE, {
          method: HttpMethod.POST,
          body: JSON.stringify(payload),
      });
      return res.data || res;
  }

  export async function updateQuiz(id: string, payload: UpdateQuizPayload): Promise<QuizBackendEntity> {
      const res = await httpClient<any>(API_ENDPOINTS.QUIZ.BY_ID(id), {
          method: HttpMethod.PUT,
          body: JSON.stringify(payload),
      });
      return res.data || res;
  }

  export async function deleteQuiz(id: string): Promise<void> {
      await httpClient<void>(API_ENDPOINTS.QUIZ.BY_ID(id), {
          method: HttpMethod.DELETE,
      });
  }
  ```

---

### Task 3: Create `CreateQuizModal` Component

**Files:**
- Create: `src/components/application/modals/create-quiz-modal.tsx`

**Interfaces:**
- Consumes: `createQuiz` from `src/services/quiz.service.ts`
- Produces: `CreateQuizModal` React component

- [ ] **Step 1: Implement Modal Component**
  Create modal to take inputs: Title (Required), Description, Pass Threshold (default 80), Course ID (optional). On save, calls `createQuiz` and triggers `onSuccess(quiz)`.

---

### Task 4: Connect `ExamSetListView` (`/exams-sets-el`) to API

**Files:**
- Modify: `src/views/exams-sets/exam-set-list-view.tsx`

**Interfaces:**
- Consumes: `getQuizzes`, `deleteQuiz` from `src/services/quiz.service.ts`, `mapBackendQuizToExamSet` from `src/types/quiz.types.ts`, `CreateQuizModal`
- Produces: Live `/exams-sets-el` list view with backend data integration.

- [ ] **Step 1: Replace MOCK data with `useEffect` fetch from `getQuizzes()`**
  Fetch quizzes on load, display loading indicator, bind search filter & pagination to fetched data.
- [ ] **Step 2: Add "Tạo bộ đề mới" button & modal handler**
  Include button in filter bar, handle modal submit & refresh quiz list.
- [ ] **Step 3: Connect Delete button to `deleteQuiz(id)`**
  Confirm deletion, call backend, show toast feedback, refresh list.

---

### Task 5: Connect `ExamSetDetailView` (`/exams-sets-el/[id]`) to API

**Files:**
- Modify: `src/views/exams-sets/exam-set-detail-view.tsx`

**Interfaces:**
- Consumes: `getQuizById`, `updateQuiz` from `src/services/quiz.service.ts`, `mapBackendQuizToExamSet`, `mapUiQuestionsToBackendDtos` from `src/types/quiz.types.ts`
- Produces: Live detail view that auto-syncs questions array to backend on create/edit/delete question.

- [ ] **Step 1: Fetch Quiz detail via `getQuizById(id)` on mount**
  Store fetched quiz and mapped questions in state. Show spinner while loading.
- [ ] **Step 2: Sync questions array on changes**
  When a question is added/updated/deleted in UI state, format all current questions using `mapUiQuestionsToBackendDtos` and invoke `updateQuiz(id, { questions: dtos })`. Update UI state with returned backend data.

---

### Task 6: Code Quality & Verification

- [ ] **Step 1: Verify TypeScript & Build**
  Run typescript check / build command to ensure zero errors.
