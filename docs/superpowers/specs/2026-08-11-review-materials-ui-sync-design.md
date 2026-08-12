# Design Specification: Review Materials View UI Synchronization

**Date**: 2026-08-11  
**Target View**: `lms-portal-admin/src/views/review-materials/review-materials-view.tsx`

## Overview
Synchronize the user interface of `ReviewMaterialsView` with the system-wide admin design guidelines (used in Courses, Classes, Quizzi Sets, etc.) while preserving the gradient statistic cards requested by the user.

## Requirements & Scope

### 1. Stats Cards (Preserved & Enhanced)
- Preserve the 4 gradient stat cards:
  - **Chờ duyệt**: Orange-red gradient (`from-[#FF9F43] to-[#FF6B6B]`)
  - **Đã duyệt**: Emerald gradient (`from-[#10AC84] to-[#2ED573]`) with `CheckCircle2` icon badge
  - **Đã từ chối**: Red gradient (`from-[#EE5253] to-[#FF4757]`) with `XCircle` icon badge
  - **Tổng cộng**: Dark slate gradient (`from-[#57606F] to-[#2F3542]`) with `FolderOpen` icon badge
- Enhance grid layout to `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` with smooth hover animations and active status indicator ring when filtered.

### 2. Tabs & Navigation Header
- Replace heavy border tabs with modern pill tab navigation:
  - Container: `inline-flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl`
  - Active Tab: `bg-wine text-white shadow-xs font-bold`
  - Inactive Tabs: `text-slate-600 hover:text-slate-900 font-semibold hover:bg-slate-200/50`

### 3. Filters Section
- Card container: `rounded-2xl border border-slate-100 bg-white p-4 shadow-xs`
- Select inputs for **Hệ đào tạo**, **Môn học**, **Session**, **Trạng thái**:
  - `rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 h-10 text-sm text-slate-800 focus:border-wine focus:bg-white focus:ring-1 focus:ring-wine outline-none transition-all`
- Search bar:
  - Relative wrapper with left search icon
  - Input: `rounded-full border border-slate-200 bg-slate-50/50 pl-9 pr-4 h-10 text-sm focus:border-wine focus:bg-white focus:ring-1 focus:ring-wine outline-none transition-all`
- Reset button:
  - `rounded-xl border border-slate-200 bg-white px-4 h-10 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors`

### 4. Table & Actions
- Container: `flex flex-col min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs`
- Table Header (`thead`):
  - `bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500`
- Table Body (`tbody`):
  - Row styling: `border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-sm text-slate-700`
- Badges:
  - Use system `Badge` from `@/components/base/badges/badges` or standard pill badges:
    - Pending (Chờ duyệt): Amber badge (`bg-amber-50 text-amber-700 border border-amber-200/60`)
    - Approved (Đã duyệt): Emerald badge (`bg-emerald-50 text-emerald-700 border border-emerald-200/60`)
    - Rejected (Từ chối): Rose badge (`bg-rose-50 text-rose-700 border border-rose-200/60`)
- Media / Content Indicators:
  - Video: Compact blue pill badge with `Video` icon
  - Document / Reading: Compact purple/red pill badge with `FileText` icon
  - Quiz: Compact indigo pill badge with `ClipboardList` icon
- Action buttons:
  - Sleek icon buttons (`View`, `Approve`, `Reject`) with hover background fills and tooltips.

### 5. Pagination & Floating Bulk Action Toolbar
- **Pagination**: Replace custom pagination with `TablePagination` component from `@/components/application/pagination/table-pagination`.
- **Bulk Action Floating Toolbar**:
  - `fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white rounded-full px-6 py-3 shadow-2xl z-50 flex items-center gap-4 border border-slate-800`
  - Quick action buttons for **Phê duyệt chọn** (`bg-emerald-600 hover:bg-emerald-700`) and **Từ chối chọn** (`bg-rose-600 hover:bg-rose-700`).

## Verification Plan
1. Test switching between tabs (Học liệu E-learning, Bài tập về nhà, Review bài kiểm tra).
2. Test stats card clicks filtering the items by status.
3. Test cascading filters (Hệ đào tạo -> Môn học -> Session) and search input.
4. Test bulk select & bulk approve/reject action toolbar.
5. Verify pagination functionality using `TablePagination`.
