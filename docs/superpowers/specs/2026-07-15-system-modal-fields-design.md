# Design Specification: SystemModal Majors & Semesters Integration

## Overview
This design details the additions to `SystemModal` to support configuring Majors (Chuyên ngành) and Semesters (Kỳ học) under a Training System. Since the backend DB represents System, Specialize (Major), and Semester as separate flat collections, the frontend will coordinate the nested UI form state and perform sequential batch API operations upon form submission.

## 1. Data Models and Types
We will expand the typescript definitions in `system.types.ts` to support specializes and semesters.

### File: [system.types.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/system.types.ts)
```typescript
export interface Semester {
    id: string;
    name: string;
    priority: number;
    specializeId: string;
    courseIds: string[];
}

export interface Specialize {
    id: string;
    name: string;
    systemId: string;
}

// Frontend nested representation for Form state
export interface FormSemester {
    id?: string;
    name: string;
}

export interface FormSpecialize {
    id?: string;
    name: string;
    semesters: FormSemester[];
    isSemestersVisible?: boolean; // Local UI state
}

export interface SystemSchemaType {
    code: string;
    name: string;
    specializes: FormSpecialize[];
}
```

## 2. API Services
We will add new HTTP requests in `system.service.ts` to handle CRUD operations for specializations and semesters.

### File: [system.service.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/services/system.service.ts)
- `getSpecializesList()`: `GET /api/staff/specializes`
- `createSpecialize(name, systemId)`: `POST /api/staff/specializes`
- `updateSpecialize(id, name)`: `PUT /api/staff/specializes/:id`
- `deleteSpecialize(id)`: `DELETE /api/staff/specializes/:id`
- `getSemestersBySpecialize(specializeId)`: `GET /api/staff/semesters/specialize/:specializeId`
- `createSemester(name, priority, specializeId)`: `POST /api/staff/semesters`
- `updateSemester(id, name)`: `PUT /api/staff/semesters/:id`
- `deleteSemester(id)`: `DELETE /api/staff/semesters/:id`

## 3. UI Component Adjustments

### File: [system-modal.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/application/modals/system-modal.tsx)
- Use React Hook Form's `useFieldArray` to manage the list of `specializes`.
- Inside each major item, use another `useFieldArray` to manage the nested list of `semesters`.
- Implement a local state or form field `isSemestersVisible` to hide/show the semesters.
- When `isOpen` changes and a `system` is provided, we fetch specializations for the system, and then fetch semesters for each specialization. Since this involves multiple calls, we will show a loading spinner in the body of the modal during loading.

### Batch Saving Flow (OnSubmit):
1. **System Creation / Update**:
   - Call `createSystem` or `updateSystem`. Get the `systemId`.
2. **Specializations / Semesters Synchronization**:
   - Compare form data against initial loaded data to determine added, updated, and deleted items.
   - For deleted items: Call deletion endpoints.
   - For updated items: Call update endpoints.
   - For new items: Call creation endpoints with the appropriate parent IDs.

## 4. Verification Plan
- Verify adding/editing/deleting a specialization.
- Verify adding/editing/deleting a semester.
- Verify the Hide/Show toggles work as expected.
- Verify validation works (e.g. empty fields are blocked).
- Verify saving creates the entities successfully on the backend and updates the table view.
