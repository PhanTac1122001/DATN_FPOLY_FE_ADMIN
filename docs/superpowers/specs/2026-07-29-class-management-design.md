# Class Management Design Specification

## Overview
Design specification for the **Class Management** feature in `lms-portal-admin`, matching the UI/UX pattern of the Staff Management page (`/staff`) and fulfilling the specifications in `lms-portal-api/docs/class_management_spec.md`.

## Data Models & Schemas

### 1. Types (`src/types/class.types.ts`)
- `Class`: Represents a class entity.
  - `id`: string
  - `name`: string
  - `classCode`: string
  - `type`?: string
  - `courseIds`?: string[]
  - `userIds`?: string[]
  - `createdAt`?: string
  - `updatedAt`?: string
- `CreateClassRequest`: DTO for creating a class (`name`, `classCode`, `type?`, `courseIds?`, `userIds?`)
- `UpdateClassRequest`: DTO for updating a class (Partial of `CreateClassRequest`)
- `ClassDetail`: Composite class detail from `GET /v1/staff/classes/:id/detail`:
  - `class`: `Class`
  - `courses`: Array of `{ id, status, startDate, endDate, courseId: { id, name, courseCode, hour }, teacherId?, taId? }`
  - `students`: Array of `{ enrollmentId, student: { id, fullName, studentCode, email }, status, isActive, enrolledAt }`
  - `summary`: `{ courseCount: number; studentCount: number; activeStudentCount: number }`

### 2. Schema (`src/schemas/class.schema.ts`)
- `classSchema`: Zod schema validating class creation & update form.
  - `name`: string (min 1 character, required)
  - `classCode`: string (min 1 character, required)
  - `type`: string optional
  - `courseIds`: string[] optional
  - `userIds`: string[] optional

### 3. API Services (`src/services/class.service.ts`)
- `getClassList()`: `GET /api/staff/classes` or `/v1/staff/classes`
- `getClassById(id: string)`: `GET /v1/staff/classes/:id`
- `getClassDetail(id: string)`: `GET /v1/staff/classes/:id/detail`
- `createClass(data: CreateClassRequest)`: `POST /v1/staff/classes`
- `updateClass(id: string, data: UpdateClassRequest)`: `PUT /v1/staff/classes/:id`
- `deleteClass(id: string)`: `DELETE /v1/staff/classes/:id`

## UI Components & Structure

### 1. Constants (`src/constants/class.constants.ts` & `ui-text.constants.ts`)
- `CLASS_FILTER_FIELDS`: Search & filter configurations for class type and status.
- `UI_TEXT.classes`: Text labels, placeholders, toasts, table headers in Vietnamese matching UI conventions.

### 2. Views & Components
- **`src/app/classes/page.tsx`**: Server page with metadata.
- **`src/views/classes/classes-client-view.tsx`**: Authenticated layout wrapper (`AdminLayout`).
- **`src/views/classes/classes-list-view.tsx`**:
  - Search bar + Filters using `SearchFilters` component.
  - "Thêm lớp học" action button opening `ClassModal`.
  - Responsive table showing Class Code, Name, Type, Courses Count, Students Count, Detail Action, Edit Action, Delete Action.
  - React Query state management with toast feedback and query invalidation.
- **`src/components/application/modals/class-modal.tsx`**:
  - Dialog modal powered by React Hook Form + Zod (`classSchema`).
  - Handles both creation and editing modes.
- **`src/components/application/modals/class-detail-modal.tsx`**:
  - Modal displaying comprehensive class details, assigned courses (with teacher & TA info), and enrolled student roster summary.

## Verification Plan
1. Type Safety & Build check: `npm run build` or `npx tsc --noEmit`.
2. UI rendering & functionality check on `/classes`.
