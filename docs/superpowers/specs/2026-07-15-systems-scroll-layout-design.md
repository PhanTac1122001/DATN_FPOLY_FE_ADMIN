# Design Specification: Systems Scroll Layout and Action Cleanup

## Overview
This design documents the adjustments made to `SystemsView` and `AdminLayout` to:
1. Prevent scrolling the entire page in Systems management.
2. Enable internal vertical and horizontal scrolling for the training systems table.
3. Remove the delete action button (Trash icon) and delete-related operations from the table view.

## 1. AdminLayout Enhancements
An optional boolean prop `disableScroll` will be introduced to `AdminLayout`.

- When `disableScroll` is `true`:
  - The root element (`#lms-shell`) is set to `h-screen overflow-hidden` instead of `min-h-screen`.
  - The `<main>` element is set to `h-screen overflow-hidden pb-0` instead of padding bottom `pb-10`.
  - The child wrapper `div` is set to `overflow-hidden pb-6` so that it doesn't overflow the viewport.

### File: `src/components/layout/admin/admin-layout.tsx`
```tsx
export function AdminLayout({ 
    children, 
    title, 
    subtitle,
    disableScroll = false
}: {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    disableScroll?: boolean;
}) {
    return (
        <div 
            id="lms-shell" 
            className={`flex bg-cream text-ink ${disableScroll ? "h-screen overflow-hidden" : "min-h-screen"}`}
        >
            <AdminSidebar />
            <main className={`flex flex-1 flex-col min-w-0 bg-cream ${disableScroll ? "h-screen overflow-hidden pb-0" : "pb-10"}`}>
                <AdminHeader title={title} subtitle={subtitle} />
                <div className={`flex flex-1 flex-col w-full px-8 pt-6 ${disableScroll ? "overflow-hidden pb-6" : ""}`}>
                    {children}
                </div>
            </main>
        </div>
    );
}
```

## 2. Systems Client View Integration
Pass `disableScroll={true}` to `AdminLayout` when rendering `SystemsView`.

### File: `src/views/systems-client-view.tsx`
```tsx
    return (
        <AdminLayout title={UI_TEXT.trainingSystem.title} subtitle={UI_TEXT.trainingSystem.subtitle} disableScroll={true}>
            <SystemsView />
        </AdminLayout>
    );
```

## 3. Systems View Adjustments
Modify `SystemsView` layout structure to:
- Fill the container height: add `flex-1 overflow-hidden` to the view's root `div`.
- Separate pagination: Place `<TablePagination>` outside the table scrollable container so it remains anchored at the bottom.
- Enable scroll: Set table wrapper to `flex-1 overflow-auto`.
- Remove the delete button from the table rows.
- Clean up unused deletion states and confirm modals if applicable.

### File: `src/views/systems-view.tsx`
- Root layout changes:
  ```tsx
  <div className="flex w-full flex-1 flex-col gap-6 overflow-hidden">
  ```
- Table Card wrapper:
  ```tsx
  <div className="rounded-2xl border border-slate-100 bg-white shadow-xs flex flex-1 flex-col min-h-0 overflow-hidden">
  ```
- Table Container:
  ```tsx
  <div className="flex-1 overflow-auto">
  ```
- Remove the `button` containing the `Trash2` icon.
- Remove unused deletion modal state `isDeleteOpen`, `setIsDeleteOpen`, mutation `deleteMutation`, and the confirmation `<ConfirmModal>`.

## 4. Verification Plan
- Verify page scrolling is disabled in the systems view (only sidebar is sticky, page content fits exactly to 100vh).
- Verify the table scrolls vertically when there are many items.
- Verify the table header and pagination remain visible.
- Verify the delete action is completely removed from the UI.
