# Design Spec: Extract Search & Filter Component

Extract the search input and advanced filter popover from [staff-list-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/staff-list-view.tsx) into a reusable `SearchFilterBar` component to facilitate reusability across list views (such as staff lists, systems management, etc.).

## Proposed Changes

### New Components

#### [NEW] [search-filter-bar.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/application/search-filters/search-filter-bar.tsx)
- Create a reusable functional component that renders the search input with right-aligned search icon, and an optional advanced filter button.
- If `filterFields`, `advancedFilterState`, and `onAdvancedFilterChange` are provided, render the `AdvancedFilter` component with a customizable trigger button.
- Properties accepted by the component:
  ```typescript
  import { FilterFieldDefinition, FilterState } from "@/types/filter.types";

  export interface SearchFilterBarProps {
      /** Current search query string */
      search: string;
      /** Callback when search query changes */
      onSearchChange: (value: string) => void;
      /** Custom placeholder text for search input */
      searchPlaceholder?: string;
      
      /** Optional: Fields config for the advanced filter */
      filterFields?: FilterFieldDefinition[];
      /** Optional: Current state of advanced filter */
      advancedFilterState?: FilterState;
      /** Optional: Callback when advanced filter changes */
      onAdvancedFilterChange?: (state: FilterState) => void;
  }
  ```
- Use `lucide-react` icons (`Search`, `Filter`) and matching styles from `staff-list-view.tsx` (`rounded-full`, `bg-wine`, `focus:border-wine`, etc.).

### Views

#### [MODIFY] [staff-list-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/staff-list-view.tsx)
- Import `SearchFilterBar` from `@/components/application/search-filters/search-filter-bar`.
- Remove manual JSX definition of Search Input and AdvancedFilter.
- Render `<SearchFilterBar />` passing `search`, `onSearchChange`, `filterFields`, `advancedFilterState`, and `onAdvancedFilterChange` (using `setAdvancedFilterState`).

## Verification Plan

### Automated Tests
- Build code via `npm run build` or run dev server to verify TS compilation.

### Manual Verification
- Verify the search and filter UI in `staff-list-view.tsx` renders and behaves exactly as before:
  - Search field inputs work and filter the list correctly.
  - Filter button opens the popover, shows the count of active filters in a badge (`bg-wine`), and filtering applies successfully when a filter condition is updated.
