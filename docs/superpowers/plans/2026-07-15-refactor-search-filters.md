# SearchFilters Component Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the shared `SearchFilters` component to use the layout, icons (`Search` and `Filter` from `lucide-react`), and styles (`focus:border-wine`, `bg-wine`) from the staff list view, and then import and use it in `StaffListView`.

**Architecture:** Extraction of UI rendering and callback functions into a single shared component (`SearchFilters`), updating the types to simplify the props API, and refactoring the call-site in `StaffListView` to import it.

**Tech Stack:** React, Tailwind CSS, TypeScript, Lucide React icons.

## Global Constraints
- None

---

### Task 1: Update SearchFiltersProps Type

**Files:**
- Modify: [application.types.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/application.types.ts)

**Interfaces:**
- Consumes: `FilterState` and `FilterFieldDefinition` from `filter.types`
- Produces: Updated `SearchFiltersProps` without mobile toggle fields.

- [ ] **Step 1: Modify SearchFiltersProps in application.types.ts**
  Replace lines 52-62 with the updated props:
  ```typescript
  export interface SearchFiltersProps {
      search: string;
      onSearchChange: (value: string) => void;
      advancedFilterState: FilterState;
      setAdvancedFilterState: (filter: FilterState) => void;
      filterFields: FilterFieldDefinition[];
      searchPlaceholder?: string;
  }
  ```

- [ ] **Step 2: Commit type changes**
  ```bash
  git add src/types/application.types.ts
  git commit -m "types: update SearchFiltersProps type interface"
  ```

---

### Task 2: Refactor SearchFilters Component

**Files:**
- Modify: [search-filters.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/application/search-filters/search-filters.tsx)

**Interfaces:**
- Consumes: `SearchFiltersProps`
- Produces: `SearchFilters` component

- [ ] **Step 1: Replace SearchFilters implementation**
  Rewrite `search-filters.tsx` using `Search` and `Filter` from `lucide-react` and matching classes from the staff list view.
  
  ```tsx
  import { Search, Filter } from "lucide-react";
  import { AdvancedFilter } from "@/components/application/advanced-filter/advanced-filter";
  import type { SearchFiltersProps } from "@/types/application.types";

  export function SearchFilters({
      search,
      onSearchChange,
      advancedFilterState,
      setAdvancedFilterState,
      filterFields,
      searchPlaceholder = "Tìm kiếm...",
  }: SearchFiltersProps) {
      return (
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              {/* Search Input */}
              <div className="relative w-full max-w-xs">
                  <input
                      type="text"
                      placeholder={searchPlaceholder}
                      value={search}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="w-full rounded-full border border-slate-200 bg-slate-50/50 py-2 pr-10 pl-4 text-sm text-slate-900 placeholder-slate-400 transition outline-none focus:border-wine focus:bg-white focus:ring-1 focus:ring-wine"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <Search className="size-4" />
                  </span>
              </div>

              {/* Advanced Filter */}
              <AdvancedFilter
                  fields={filterFields}
                  value={advancedFilterState}
                  onChange={setAdvancedFilterState}
                  hideOperator={true}
                  trigger={
                      <button
                          type="button"
                          className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                          <Filter className="size-4" />
                          <span>Bộ lọc</span>
                          {advancedFilterState.conditions.length > 0 && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wine text-xs font-bold text-white">
                                  {advancedFilterState.conditions.length}
                              </span>
                          )}
                      </button>
                  }
              />
          </div>
      );
  }
  ```

- [ ] **Step 2: Commit component changes**
  ```bash
  git add src/components/application/search-filters/search-filters.tsx
  git commit -m "feat: refactor SearchFilters component with wine theme and lucide-react icons"
  ```

---

### Task 3: Use SearchFilters in StaffListView

**Files:**
- Modify: [staff-list-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/staff-list-view.tsx)

**Interfaces:**
- Consumes: `SearchFilters` from `@/components/application/search-filters/search-filters`

- [ ] **Step 1: Import SearchFilters and remove unused imports in staff-list-view.tsx**
  Add the import of `SearchFilters`. Clean up unused `Search` and `Filter` imports from `lucide-react`.

- [ ] **Step 2: Replace inline code in staff-list-view.tsx**
  Replace lines 173-206 with:
  ```tsx
  <SearchFilters
      search={search}
      onSearchChange={setSearch}
      advancedFilterState={advancedFilterState}
      setAdvancedFilterState={setAdvancedFilterState}
      filterFields={filterFields}
      searchPlaceholder={UI_TEXT.staff.searchPlaceholder}
  />
  ```

- [ ] **Step 3: Commit integration changes**
  ```bash
  git add src/views/staff-list-view.tsx
  git commit -m "refactor: use SearchFilters component in StaffListView"
  ```

---

## Verification Plan

### Automated Tests
- Build check: Run `npm run type-check` or `npx tsc --noEmit` in `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin` to confirm TypeScript compiling.

### Manual Verification
- Launch the admin portal interface, navigate to the staff page, verify that the search bar and filter button are displayed, functional, and layout behaves identically to the original layout on both mobile and desktop views.
