# Material Review API Integration & Admin UI Design

Date: 2026-08-11
Topic: Material Review (`/review-materials`)

## Overview

This feature provides staff/admin users with a dedicated interface (`/review-materials`) to review and approve/reject learning materials (E-learning lessons and Homework assignments) grouped by Program/Specialization, Subject/Course, and Session.

## User Flow

1. User navigates to `/review-materials` from the sidebar menu.
2. User sees **Top Navigation Tabs**:
   - **E-learning Lessons** (`lessons`) - Default active tab
   - **Homework Assignments** (`homework`)
3. User filters materials using the cascading filter bar:
   - **Specialization / Program** (`/staff/specializes`)
   - **Course / Subject** (`/staff/courses`)
   - **Session** (`/staff/sessions/course/:courseId`)
   - **Search** (filters by lesson title or homework title/description)
   - **Status** (All, Pending = 0, Approved = 1, Rejected = 2)
4. Staff can review aggregate counts on 4 summary cards:
   - Total Materials
   - Pending Approval (`0`)
   - Approved (`1`)
   - Rejected (`2`)
5. Staff can approve or reject items individually or perform bulk approval/rejection on multiple selected items.

---

## API Endpoints (`lms-portal-api`)

Base URL: `/staff/review-materials` (Guard: `StaffAuthServiceGuard`)

### 1. Fetch Lessons for Review
- **Endpoint**: `GET /staff/review-materials/lessons`
- **Query Params**:
  - `sessionId` (string, required)
  - `status` (number, optional: `0`=Pending, `1`=Approved, `2`=Rejected)
  - `search` (string, optional)
- **Response**:
  ```json
  {
    "stats": {
      "pendingCount": 5,
      "approvedCount": 10,
      "rejectedCount": 1,
      "totalCount": 16
    },
    "items": [ /* LessonEntity[] */ ]
  }
  ```

### 2. Fetch Homework for Review
- **Endpoint**: `GET /staff/review-materials/homework`
- **Query Params**:
  - `sessionId` (string, required)
  - `status` (number, optional: `0`=Pending, `1`=Approved, `2`=Rejected)
  - `search` (string, optional)
- **Response**:
  ```json
  {
    "stats": {
      "pendingCount": 2,
      "approvedCount": 8,
      "rejectedCount": 0,
      "totalCount": 10
    },
    "items": [ /* HomeworkEntity[] */ ]
  }
  ```

### 3. Individual Status Updates
- `PATCH /staff/review-materials/lessons/:id/approve`
- `PATCH /staff/review-materials/lessons/:id/reject`
- `PATCH /staff/review-materials/homework/:id/approve`
- `PATCH /staff/review-materials/homework/:id/reject`

### 4. Bulk Status Updates
- `PATCH /staff/review-materials/lessons/bulk/approve` -> Body: `{ ids: string[] }`
- `PATCH /staff/review-materials/lessons/bulk/reject` -> Body: `{ ids: string[] }`
- `PATCH /staff/review-materials/homework/bulk/approve` -> Body: `{ ids: string[] }`
- `PATCH /staff/review-materials/homework/bulk/reject` -> Body: `{ ids: string[] }`

---

## Frontend Architecture (`lms-portal-admin`)

### File Structure
- `src/types/review-materials.types.ts`: TypeScript interfaces for stats, review query DTOs, response structures.
- `src/services/review-materials.service.ts`: API service wrappers around `httpClient`.
- `src/views/review-materials/review-materials-view.tsx`: Main view component containing tabs, filter toolbar, summary cards, and data table.
- `src/app/review-materials/page.tsx`: Next.js App Router page wrapping `ReviewMaterialsView`.

### Data Flow & Component State
- `activeTab`: `'lessons' | 'homework'`
- `selectedSpecializeId`: string
- `selectedCourseId`: string
- `selectedSessionId`: string
- `searchQuery`: string
- `selectedStatus`: number | undefined
- `selectedItemIds`: Set of string IDs for bulk selection
- `stats`: `{ pendingCount, approvedCount, rejectedCount, totalCount }`
- `lessonsList` / `homeworkList`: Array of fetched items

---

## Verification Plan

### Automated / Syntax Check
- Run `npm run build` or typecheck in `lms-portal-admin` to ensure no TypeScript or Next.js build errors.

### Manual Verification
- Navigate to `http://localhost:3000/review-materials`.
- Select Specialization -> Course -> Session.
- Verify stats cards update accurately.
- Switch between "Bài học E-learning" and "Bài tập về nhà" tabs.
- Test searching by name/description.
- Test individual Approve / Reject actions.
- Test bulk selection and Bulk Approve / Reject.
