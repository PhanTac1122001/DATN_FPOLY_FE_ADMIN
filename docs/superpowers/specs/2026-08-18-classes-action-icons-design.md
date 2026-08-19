# Design Specification: Class Action Icons in Classes List View

## Overview
Replace the row action dropdown menu (`Dropdown.Root`, `Dropdown.DotsButton`, `Dropdown.Popover`) in `ClassesListView` (`/classes`) with direct icon action buttons matching the UI style used in `CoursesListView` (`/courses`).

## Proposed Changes

### `c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/classes/classes-list-view.tsx`

1. Remove unused `Dropdown` import from `@/components/base/dropdown/dropdown`.
2. Replace table action cell content (formerly rendering a 3-dots dropdown button) with 3 inline circular action buttons:
   - **View Detail Button**:
     - Icon: `<Eye className="size-4" />`
     - Styling: `inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition duration-200 hover:scale-105 hover:bg-indigo-600 hover:text-white`
     - Action: `handleOpenDetail(cls)`
     - Tooltip (`title`): `UI_TEXT.classes.classDetail`
   - **Edit Class Button**:
     - Icon: `<Edit className="size-4" />`
     - Styling: `inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition duration-200 hover:bg-emerald-600 hover:text-white`
     - Action: `handleOpenEdit(cls)`
     - Tooltip (`title`): `UI_TEXT.classes.editClass`
   - **Delete Class Button**:
     - Icon: `<Trash2 className="size-4" />`
     - Styling: `inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white`
     - Action: `handleOpenDelete(cls)`
     - Tooltip (`title`): `UI_TEXT.classes.deleteClass`

## Verification Plan
1. Check TypeScript compilation (`npm run build` or IDE linter) to ensure no unused imports or syntax errors.
2. Confirm the row actions in `/classes` render as 3 round icon buttons aligned horizontally.
3. Test clicking each icon button to verify detail navigation, edit modal opening, and delete confirmation modal opening.
