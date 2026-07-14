# Extract Search & Filter Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the search input and advanced filter popover from `staff-list-view.tsx` into a reusable `SearchFilterBar` component.

**Architecture:** Create a new component `SearchFilterBar` under `src/components/application/search-filters/` with typed props, supporting both search-only and search-with-advanced-filter modes. Integrate the new component into `staff-list-view.tsx`.

**Tech Stack:** React, Next.js, Tailwind CSS, TypeScript, Lucide React icons.

## Global Constraints
- Do not use placeholders or incomplete code.
- Follow existing import styles and Tailwind class configurations.

---

### Task 1: Create the Reusable `SearchFilterBar` Component

**Files:**
- Create: `src/components/application/search-filters/search-filter-bar.tsx`

**Interfaces:**
- Consumes: `FilterFieldDefinition`, `FilterState` from `@/types/filter.types`, `AdvancedFilter` from `@/components/application/advanced-filter/advanced-filter`
- Produces: `SearchFilterBar` React component, `SearchFilterBarProps` interface

- [ ] **Step 1: Create file and implement `SearchFilterBar` component**

Write the code to `src/components/application/search-filters/search-filter-bar.tsx`:

```tsx
import { Search, Filter } from "lucide-react";
import { AdvancedFilter } from "@/components/application/advanced-filter/advanced-filter";
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

export function SearchFilterBar({
    search,
    onSearchChange,
    searchPlaceholder = "Tìm kiếm...",
    filterFields,
    advancedFilterState,
    onAdvancedFilterChange,
}: SearchFilterBarProps) {
    const showAdvancedFilter = filterFields && advancedFilterState && onAdvancedFilterChange;

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
            {showAdvancedFilter && (
                <AdvancedFilter
                    fields={filterFields}
                    value={advancedFilterState}
                    onChange={onAdvancedFilterChange}
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
            )}
        </div>
    );
}
```

- [ ] **Step 2: Commit Task 1**

```bash
git add src/components/application/search-filters/search-filter-bar.tsx
git commit -m "feat: add reusable SearchFilterBar component"
```

---

### Task 2: Integrate `SearchFilterBar` into `StaffListView`

**Files:**
- Modify: `src/views/staff-list-view.tsx`

**Interfaces:**
- Consumes: `SearchFilterBar` from `@/components/application/search-filters/search-filter-bar`

- [ ] **Step 1: Modify `src/views/staff-list-view.tsx` to use `SearchFilterBar`**
- Import `SearchFilterBar` at the top of the file.
- Replace lines 170-207 with `<SearchFilterBar />` with the appropriate props.
- Clean up unused imports (such as `Search`, `Filter`, `AdvancedFilter` if they are no longer used anywhere else in the file - wait, check if `Search`, `Filter`, or `AdvancedFilter` are used elsewhere).

Code changes:

```tsx
import { SearchFilterBar } from "@/components/application/search-filters/search-filter-bar";
```

Replace:
```tsx
                    <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                        {/* Search Input */}
                        <div className="relative w-full max-w-xs">
                            <input
                                type="text"
                                placeholder={UI_TEXT.staff.searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
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
```

With:
```tsx
                    <SearchFilterBar
                        search={search}
                        onSearchChange={setSearch}
                        searchPlaceholder={UI_TEXT.staff.searchPlaceholder}
                        filterFields={filterFields}
                        advancedFilterState={advancedFilterState}
                        onAdvancedFilterChange={setAdvancedFilterState}
                    />
```

- [ ] **Step 2: Run verification and build the application**

Run the build command:
`npm run build` or inspect compilation with Next.js compiler.

- [ ] **Step 3: Commit Task 2**

```bash
git add src/views/staff-list-view.tsx
git commit -m "refactor: use SearchFilterBar component in StaffListView"
```
