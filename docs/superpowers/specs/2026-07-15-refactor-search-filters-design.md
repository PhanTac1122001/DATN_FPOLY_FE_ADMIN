# Design Spec: SearchFilters Component Refactoring

Refactor the shared `SearchFilters` component to use the styling, layout, and icon design from the `StaffListView` page, making it reusable across the application.

## Proposed Changes

### Types

#### [MODIFY] [application.types.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/application.types.ts)
Update `SearchFiltersProps` to:
- Remove mobile search visibility toggling props (`isMobileSearchVisible`, `setIsMobileSearchVisible`).
- Keep essential search, advanced filter, and option fields.

### Components

#### [MODIFY] [search-filters.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/application/search-filters/search-filters.tsx)
- Import `Search` and `Filter` from `lucide-react`.
- Re-implement the component layout to render the inline search input and advanced filter button.
- Use `focus:border-wine`, `focus:ring-wine`, and `bg-wine` badge for the applied filter count to match the design from the `StaffListView`.

### Views

#### [MODIFY] [staff-list-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/staff-list-view.tsx)
- Import `<SearchFilters>` from `@/components/application/search-filters/search-filters`.
- Replace the inline search input and the `AdvancedFilter` component block with the unified `<SearchFilters>` component.

## Verification Plan

### Automated Tests
- Run `npm run build` or development server lint/type checks to verify that the TypeScript compiler passes and imports are correct.

### Manual Verification
- Verify the search and filter behavior in the LMS admin dashboard UI.
- Verify the responsive behavior on mobile/desktop screens.
