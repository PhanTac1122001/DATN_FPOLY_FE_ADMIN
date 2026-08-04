# Design Spec: Staff List View Filter Refactoring

Refactoring the filters in the Staff list view from separate, static Select dropdowns to a consolidated advanced popover filter matching the design reference, while omitting the operator ("Bằng") selector.

## Proposed Changes

### Types & Interfaces

#### [MODIFY] [filter.types.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/filter.types.ts)
- Add optional `hideOperator?: boolean` property to `AdvancedFilterProps`.

#### [MODIFY] [application.types.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/application.types.ts)
- Add optional `hideOperator?: boolean` property to `AdvancedFilterProps`.

### Base Components

#### [MODIFY] [advanced-filter.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/application/advanced-filter/advanced-filter.tsx)
- Accept `hideOperator` prop (defaulting to `false`).
- In `handleAddCondition`, default operator to `FilterOperator.EQUALS` when adding a condition if `hideOperator` is true.
- In Field Selector `onSelectionChange`, set operator to `FilterOperator.EQUALS` if `hideOperator` is true.
- Conditionally hide the operator select dropdown: `{!hideOperator && ...}`.
- Adjust classes inside condition row layout to ensure field selector and value input align beautifully when operator is hidden.
- Swap `Select.ComboBox` for standard `Select` for `FilterFieldType.ENUM` values to align with the visual mockup (simpler dropdown menu with checkable options, no search box).

### Views

#### [MODIFY] [staff-list-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/staff-list-view.tsx)
- Remove `roleFilter` and `statusFilter` states.
- Introduce `advancedFilterState` of type `FilterState` (initial value `{ conditions: [] }`).
- Define `filterFields` array containing definitions for "Vai trò" (role) and "Trạng thái" (status) using ENUM field type.
- Integrate `AdvancedFilter` component with `hideOperator={true}`.
- Add trigger button styled as a pill (`rounded-full`) with funnel (`Filter`) icon and text "Bộ lọc".
- Relocate Search icon to the right side of the search input.
- Revise filtering logic to evaluate active conditions in `advancedFilterState`.

## Verification Plan

### Automated Tests
- Build code via `npm run build` or start dev server to verify TS compilation.

### Manual Verification
- Click on "Bộ lọc" and verify popover opens correctly.
- Add condition, select "Vai trò", choose a role, and click "Áp dụng" (Apply) to verify the list filters correctly.
- Add condition, select "Trạng thái", choose status, and click "Áp dụng" (Apply) to verify list filters.
- Verify operator selector ("Bằng") is not shown.
- Click "Xóa bộ lọc" (Clear filter) to check if all conditions are cleared.
- Verify search input has icon on the right.
