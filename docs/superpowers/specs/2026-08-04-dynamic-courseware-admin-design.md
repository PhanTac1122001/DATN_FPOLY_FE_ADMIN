# Design Spec: Dynamic Courseware Integration (lms-portal-admin)

- **Date**: 2026-08-04
- **Target App**: `lms-portal-admin`
- **Scope**: Phase 1 - Dynamic Session Types (`SessionType`) & Session Form Integration

---

## 1. Overview & Goals

Integrate Phase 1 of the Dynamic Courseware specification ([2026-07-31-dynamic-courseware-design.md](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-api/docs/superpowers/specs/2026-07-31-dynamic-courseware-design.md)) into `lms-portal-admin`:
1. Implement `SessionType` management service and UI components in `lms-portal-admin` connecting to `/v1/staff/session-types`.
2. Update Session creation/editing forms in course detail workspace (`type-detail-course-view.tsx` & `session-form.tsx`) to load dynamic `SessionType` options from backend instead of hardcoding `LY_THUYET` and `THUC_HANH`.
3. Provide a modal for Staff to manage (view, create, update, active/inactive toggle, delete) `SessionType` entries directly from the course editor interface.

---

## 2. API Contract & Data Model

### 2.1 Types (`src/types/session-type.types.ts`)
```ts
export interface SessionType {
    id: string;
    code: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    position: number;
    isActive: boolean;
    isSystem: boolean;
    defaultBlocks?: Array<{
        type: string;
        title: string;
        isRequired: boolean;
        completionCriteria?: Record<string, unknown>;
    }>;
}

export interface CreateSessionTypeDto {
    code: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    isActive?: boolean;
}

export interface UpdateSessionTypeDto {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    isActive?: boolean;
}
```

### 2.2 Endpoints (`src/services/session-type.service.ts`)
- `GET /v1/staff/session-types?includeInactive=true`: Fetch all session types.
- `POST /v1/staff/session-types`: Create a new session type.
- `PATCH /v1/staff/session-types/:id`: Update existing session type (name, description, color, icon, isActive).
- `DELETE /v1/staff/session-types/:id`: Remove or soft-deactivate session type.

---

## 3. UI Components & Flow

1. **`SessionTypeModal` (`src/components/application/modals/session-type-modal.tsx`)**:
   - Manage list of session types (data table / list view).
   - Form inputs for creating a new session type (`code`, `name`, `description`, `color`, `icon`).
   - Edit dialog for updating `name`, `color`, `icon`, `isActive`.
   - Delete/Deactivate button with confirmation.
2. **`SessionForm` (`src/views/type/type-detail-course/components/session-form.tsx`)**:
   - Dynamically load session types list using `useQuery` / `sessionTypeService.getAll()`.
   - Render dropdown select for `type` showing `name` and colored badge.
   - Include a quick link "+ Quản lý loại buổi học" to open `SessionTypeModal`.

---

## 4. Verification Plan

- Run TypeScript type checking (`npx tsc --noEmit`).
- Verify production build (`npm run build`).
