# Systems (Training Systems) Management Design

Design specification for implementing the Systems (Hệ đào tạo) management page inside the admin portal. This specifies routing, backend API integration, table view with pagination, search filtering, and CRUD operations.

## User Review Required

> [!IMPORTANT]
> The backend GET `/systems` API returns all systems without server-side pagination. We will implement **client-side pagination** using the pre-existing `<TablePagination />` component to handle pagination smoothly.
> 
> The layout will feature:
> 1. An **"Add Training System"** (Thêm hệ đào tạo) button.
> 2. A search input for filtering systems by name and code.
> 3. A paginated table showing `No.`, `Id hệ`, `Tên hệ`, `Mã hệ`, `Ngày tạo`, and `Hành động`.
> 4. Actions: "Xem chi tiết" (opens edit modal), "Lộ trình học" (placeholder action), and a delete option (trash button or dropdown).

## Open Questions

None. The user clarified the API endpoint (`/v1/systems` which is proxied to `/api/systems`) and requested client-side pagination as shown in the screenshot.

---

## Proposed Changes

### Configuration & Routing

#### [MODIFY] [admin-sidebar.constants.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/constants/admin-sidebar.constants.ts)
* Update the routing path for "Hệ đào tạo" from `/training-systems-dt` to `/systems` to match the requested URL.

#### [NEW] [page.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/app/systems/page.tsx)
* Create the Next.js page component at `src/app/systems/page.tsx` that exports metadata and renders the client view.

---

### Services & Types

#### [NEW] [system.types.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/system.types.ts)
* Define the TypeScript interfaces for:
  - `System` (id, systemCode, name, createdAt)
  - `CreateSystemRequest` (name, code)
  - `UpdateSystemRequest` (name, code)
  - `SystemModalProps` (isOpen, onClose, system)

#### [NEW] [system.service.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/services/system.service.ts)
* Implement CRUD functions:
  - `getSystemsList(): Promise<System[]>` -> GET `/api/systems`
  - `createSystem(data: CreateSystemRequest): Promise<System>` -> POST `/api/systems`
  - `updateSystem(id: string, data: UpdateSystemRequest): Promise<System>` -> PUT `/api/systems/${id}`
  - `deleteSystem(id: string): Promise<void>` -> DELETE `/api/systems/${id}`

---

### Schema & Validation

#### [NEW] [system.schema.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/schemas/system.schema.ts)
* Create Zod validation schema:
  - `systemSchema`: validate `code` (required, min 1 chars) and `name` (required, min 1 chars).

---

### Components & Views

#### [NEW] [system-modal.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/application/modals/system-modal.tsx)
* Form component using `react-hook-form` + `zodResolver`.
* Handles both creation and update actions with success toast notifications.
* Form fields: Mã hệ đào tạo (code), Tên hệ đào tạo (name).

#### [NEW] [systems-client-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/systems-client-view.tsx)
* Client-side auth wrapper and page layout component, importing `<AdminLayout>` and rendering `<SystemsView />`.

#### [NEW] [systems-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/systems-view.tsx)
* Main view containing the listing table.
* Uses `@tanstack/react-query` to fetch systems.
* Implements search filtering and client-side pagination (using `<TablePagination />`).
* Renders the table layout matching the provided screenshot.
* Renders action buttons "Xem chi tiết" and "Lộ trình học" along with a "Delete" option.

---

### UI Translations

#### [MODIFY] [ui-text.constants.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/constants/ui-text.constants.ts)
* Add `trainingSystem` translation block with Vietnamese labels, placeholders, titles, and toast messages.

## Verification Plan

### Automated Verification
* Run `npm run build` or build verification to ensure no TypeScript compilation errors.

### Manual Verification
* Access `/systems` in the browser.
* Verify the listing table displays correct columns (`No.`, `Id hệ`, `Tên hệ`, `Mã hệ`, `Ngày tạo`, `Hành động`).
* Test pagination buttons, page limits, and page number input behavior.
* Test search bar filtering.
* Test "Thêm hệ đào tạo" button opens the modal, creates a system, and shows a success toast.
* Test "Xem chi tiết" opens the edit modal, populates the fields, updates the system, and refreshes the table.
* Test deleting a system with the confirmation modal.
