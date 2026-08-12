# Material Review API Integration & Admin UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the frontend Material Review feature (`/review-materials`) in `lms-portal-admin` to connect with `lms-portal-api` endpoints for reviewing lessons and homework.

**Architecture:** Create `review-materials.types.ts` for data transfer objects, `review-materials.service.ts` for API interactions, `review-materials-view.tsx` for the full UI (Tabs, Filters, Stats Cards, DataTable, Bulk Actions), and `src/app/review-materials/page.tsx` Next.js page wrapper.

**Tech Stack:** React 19, Next.js App Router, TypeScript, Tailwind CSS, Lucide Icons, Shadcn UI components.

## Global Constraints

- API Base Route: `/staff/review-materials`
- Lesson status values: `0` = Pending, `1` = Approved, `2` = Rejected
- Homework status values: `0` = Pending, `1` = Approved, `2` = Rejected

---

### Task 1: Create Types for Material Review

**Files:**
- Create: `src/types/review-materials.types.ts`

**Interfaces:**
- Produces: `ReviewStats`, `ReviewLessonItem`, `ReviewHomeworkItem`, `ReviewLessonListResponse`, `ReviewHomeworkListResponse`, `GetReviewMaterialsQuery`

- [ ] **Step 1: Create type definitions**

Write content to `src/types/review-materials.types.ts`:
```typescript
export interface ReviewStats {
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalCount: number;
}

export interface ReviewLessonItem {
    id: string;
    name: string;
    sessionId: string;
    approvalStatus: number; // 0=PENDING, 1=APPROVED, 2=REJECTED
    position?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ReviewHomeworkItem {
    id: string;
    title: string;
    description?: string;
    sessionId: string;
    status: number; // 0=PENDING, 1=APPROVED, 2=REJECTED
    position?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ReviewLessonListResponse {
    stats: ReviewStats;
    items: ReviewLessonItem[];
}

export interface ReviewHomeworkListResponse {
    stats: ReviewStats;
    items: ReviewHomeworkItem[];
}

export interface GetReviewMaterialsQuery {
    sessionId: string;
    status?: number;
    search?: string;
}
```

- [ ] **Step 2: Verify type compilation**

Run: `npx tsc --noEmit` in `lms-portal-admin`

---

### Task 2: Create API Service for Material Review

**Files:**
- Create: `src/services/review-materials.service.ts`

**Interfaces:**
- Consumes: `src/types/review-materials.types.ts`
- Produces: `reviewMaterialsService` object with methods `getLessons`, `getHomework`, `approveLesson`, `rejectLesson`, `bulkApproveLessons`, `bulkRejectLessons`, `approveHomework`, `rejectHomework`, `bulkApproveHomework`, `bulkRejectHomework`

- [ ] **Step 1: Create service implementation**

Write content to `src/services/review-materials.service.ts`:
```typescript
import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type {
    GetReviewMaterialsQuery,
    ReviewHomeworkListResponse,
    ReviewLessonListResponse,
} from "@/types/review-materials.types";

function unwrap<T>(response: unknown): T {
    if (response && typeof response === "object" && "data" in response) {
        return ((response as { data: T }).data ?? response) as T;
    }
    return response as T;
}

export const reviewMaterialsService = {
    getLessons: async (query: GetReviewMaterialsQuery): Promise<ReviewLessonListResponse> => {
        const params = new URLSearchParams();
        params.set("sessionId", query.sessionId);
        if (query.status !== undefined) params.set("status", String(query.status));
        if (query.search) params.set("search", query.search);

        const response = await httpClient<any>(`/staff/review-materials/lessons?${params.toString()}`, {
            method: HttpMethod.GET,
        });
        return unwrap<ReviewLessonListResponse>(response);
    },

    getHomework: async (query: GetReviewMaterialsQuery): Promise<ReviewHomeworkListResponse> => {
        const params = new URLSearchParams();
        params.set("sessionId", query.sessionId);
        if (query.status !== undefined) params.set("status", String(query.status));
        if (query.search) params.set("search", query.search);

        const response = await httpClient<any>(`/staff/review-materials/homework?${params.toString()}`, {
            method: HttpMethod.GET,
        });
        return unwrap<ReviewHomeworkListResponse>(response);
    },

    approveLesson: async (id: string): Promise<any> => {
        const response = await httpClient<any>(`/staff/review-materials/lessons/${id}/approve`, {
            method: HttpMethod.PATCH,
        });
        return unwrap(response);
    },

    rejectLesson: async (id: string): Promise<any> => {
        const response = await httpClient<any>(`/staff/review-materials/lessons/${id}/reject`, {
            method: HttpMethod.PATCH,
        });
        return unwrap(response);
    },

    bulkApproveLessons: async (ids: string[]): Promise<{ updated: number }> => {
        const response = await httpClient<any>("/staff/review-materials/lessons/bulk/approve", {
            method: HttpMethod.PATCH,
            body: JSON.stringify({ ids }),
        });
        return unwrap(response);
    },

    bulkRejectLessons: async (ids: string[]): Promise<{ updated: number }> => {
        const response = await httpClient<any>("/staff/review-materials/lessons/bulk/reject", {
            method: HttpMethod.PATCH,
            body: JSON.stringify({ ids }),
        });
        return unwrap(response);
    },

    approveHomework: async (id: string): Promise<any> => {
        const response = await httpClient<any>(`/staff/review-materials/homework/${id}/approve`, {
            method: HttpMethod.PATCH,
        });
        return unwrap(response);
    },

    rejectHomework: async (id: string): Promise<any> => {
        const response = await httpClient<any>(`/staff/review-materials/homework/${id}/reject`, {
            method: HttpMethod.PATCH,
        });
        return unwrap(response);
    },

    bulkApproveHomework: async (ids: string[]): Promise<any> => {
        const response = await httpClient<any>("/staff/review-materials/homework/bulk/approve", {
            method: HttpMethod.PATCH,
            body: JSON.stringify({ ids }),
        });
        return unwrap(response);
    },

    bulkRejectHomework: async (ids: string[]): Promise<any> => {
        const response = await httpClient<any>("/staff/review-materials/homework/bulk/reject", {
            method: HttpMethod.PATCH,
            body: JSON.stringify({ ids }),
        });
        return unwrap(response);
    },
};
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit` in `lms-portal-admin`

---

### Task 3: Create ReviewMaterialsView Component

**Files:**
- Create: `src/views/review-materials/review-materials-view.tsx`

**Interfaces:**
- Consumes: `reviewMaterialsService`, `system.service.ts`, `course.service.ts`, `session.staff.controller.ts` endpoints
- Produces: React component `ReviewMaterialsView`

- [ ] **Step 1: Build the View Component**

Create `src/views/review-materials/review-materials-view.tsx` with:
- Top tabs: `Lessons` vs `Homework`
- Filters: Specialization (Program) -> Course (Subject) -> Session
- Search input & Status filter dropdown
- 4 Stat cards (Total, Pending, Approved, Rejected)
- Multi-select data table with single and bulk Approve/Reject actions
- Toast notifications on success/failure

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit` in `lms-portal-admin`

---

### Task 4: Create Next.js Page Route

**Files:**
- Create: `src/app/review-materials/page.tsx`

**Interfaces:**
- Consumes: `ReviewMaterialsView`

- [ ] **Step 1: Create Next.js page file**

Write content to `src/app/review-materials/page.tsx`:
```tsx
import { ReviewMaterialsView } from "@/views/review-materials/review-materials-view";

export const metadata = {
    title: "Duyệt học liệu - Admin Portal",
};

export default function ReviewMaterialsPage() {
    return <ReviewMaterialsView />;
}
```

- [ ] **Step 2: Run build check**

Run: `npm run build` in `lms-portal-admin` to ensure page builds without errors.

---

### Task 5: Manual Verification

- Verify page loads at `http://localhost:3000/review-materials`
- Check Specialization, Course, Session selection
- Verify data loading, tab switching, search filtering, and single/bulk approvals/rejections.
