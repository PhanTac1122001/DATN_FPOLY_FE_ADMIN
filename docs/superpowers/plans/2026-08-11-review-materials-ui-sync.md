# Review Materials View UI Synchronization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor and synchronize the UI of `ReviewMaterialsView` (`lms-portal-admin/src/views/review-materials/review-materials-view.tsx`) with the rest of the admin portal design system while preserving stat cards.

**Architecture:** Update layout, filter elements, table header, table row badges, buttons, pagination, and bulk floating toolbar using standard Tailwind tokens and existing application components (`TablePagination`).

**Tech Stack:** Next.js, React, TailwindCSS, Lucide Icons, TypeScript.

## Global Constraints

- Preserve stats cards gradient colors and click handlers verbatim.
- Replace pagination with `TablePagination` component from `@/components/application/pagination/table-pagination`.
- Keep existing data fetching hooks, filters logic, and review service calls intact.

---

### Task 1: Refactor Layout Header, Tabs Navigation, and Filter Bar

**Files:**
- Modify: `c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/review-materials/review-materials-view.tsx`

**Interfaces:**
- Consumes: `TabType`, `specialize`, `course`, `session`, `status` states in `ReviewMaterialsView`.
- Produces: Updated top tabs navigation bar and filter section styled according to system design tokens.

- [ ] **Step 1: Update Tabs Navigation to System Pill Bar**

Update tab buttons container to `inline-flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl` and individual tabs to use `bg-wine text-white shadow-xs font-bold` for active state.

- [ ] **Step 2: Update Filters Panel Styling**

Update filters container to `rounded-2xl border border-slate-100 bg-white p-4 shadow-xs mb-6`. Standardize dropdown select classes to `w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 h-10 text-sm text-slate-800 outline-none focus:border-wine focus:bg-white transition-all`. Update search input to `w-full rounded-full border border-slate-200 bg-slate-50/50 pl-9 pr-4 h-10 text-sm focus:border-wine focus:bg-white outline-none transition-all`.

- [ ] **Step 3: Verify build**

Run build or check TS types.

---

### Task 2: Refactor Data Table, Status Badges, and Action Buttons

**Files:**
- Modify: `c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/review-materials/review-materials-view.tsx`

**Interfaces:**
- Consumes: `lessons`, `homework`, `paginatedList`, `selectedIds`.
- Produces: Updated table styling, system status badges, media tag buttons, and action buttons.

- [ ] **Step 1: Update Table Outer Container & Header**

Wrap table in `min-h-0 flex-1 overflow-auto rounded-2xl border border-slate-100 bg-white shadow-xs`.
Set header `thead tr` to `bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500`.

- [ ] **Step 2: Update Table Rows, Badges, and Action Buttons**

Change row border and background hover state to `border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-sm text-slate-700`.
Update status badges:
- Approved: `bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full px-2.5 py-1 text-[11px] font-bold`
- Rejected: `bg-rose-50 text-rose-700 border border-rose-200/60 rounded-full px-2.5 py-1 text-[11px] font-bold`
- Pending: `bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full px-2.5 py-1 text-[11px] font-bold`

Update action buttons (`Xem`, `Duyệt`, `Từ chối`) with sleek, modern icon/text designs and rounded borders.

---

### Task 3: Replace Pagination & Refactor Floating Bulk Toolbar

**Files:**
- Modify: `c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/review-materials/review-materials-view.tsx`

**Interfaces:**
- Consumes: `TablePagination` from `@/components/application/pagination/table-pagination`.
- Produces: Integrated `TablePagination` for material list pagination and floating pill bulk action bar.

- [ ] **Step 1: Import TablePagination and replace footer pagination**

Import `TablePagination` from `@/components/application/pagination/table-pagination`.
Replace custom bottom pagination HTML with:
```tsx
<TablePagination
    total={totalItems}
    page={validCurrentPage}
    totalPages={totalPages}
    limit={pageSize}
    onPageChange={(p) => setCurrentPage(p)}
    onLimitChange={() => {}}
    className="pt-4 border-t border-slate-100"
/>
```

- [ ] **Step 2: Update Floating Bulk Action Bar**

Refactor floating bar to:
```tsx
<div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-slate-800 text-white rounded-full px-6 py-3 shadow-2xl z-50 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5">
    <span className="font-bold text-xs sm:text-sm flex items-center gap-2">
        <CheckSquare className="size-4 text-amber-400" />
        Đã chọn <strong className="text-amber-400 text-sm">{selectedIds.length}</strong> mục
    </span>
    <div className="w-px h-4 bg-white/20" />
    <button
        onClick={handleBulkApprove}
        disabled={isActionLoading}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-50"
    >
        <CheckCircle2 className="size-3.5" />
        Duyệt chọn
    </button>
    <button
        onClick={handleBulkReject}
        disabled={isActionLoading}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer disabled:opacity-50"
    >
        <XCircle className="size-3.5" />
        Từ chối chọn
    </button>
</div>
```

- [ ] **Step 3: Verification & Commit**

Verify that all UI components render correctly, zero lint errors, and commit changes.
