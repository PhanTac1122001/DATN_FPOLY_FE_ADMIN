# Synchronize Quizzi Set Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align `CreateQuizziSetModal` (`create-quizzi-set-modal.tsx`) structure, scrolling behavior, close button, and footer action buttons with `StaffModal` (`staff-modal.tsx`).

**Architecture:** Refactor `CustomModal.Content` and `Dialog` wrapper classes so the modal header and footer remain fixed while only the form body scrolls. Replace raw HTML buttons with `@/components/base/buttons/button` `Button` components and remove syntax artifacts.

**Tech Stack:** React, Next.js, Tailwind CSS, TypeScript, `react-aria-components`, Lucide icons.

## Global Constraints

- Preserve all existing form state, handlers (Excel import, session selection, question addition/removal, option toggling), and service submission logic.
- Follow `StaffModal` modal wrapper and button patterns.

---

### Task 1: Refactor `CreateQuizziSetModal` Layout, Scrolling, Close Button, and Footer

**Files:**
- Modify: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\components\application\modals\create-quizzi-set-modal.tsx:273-633`

**Interfaces:**
- Consumes: `@/components/base/buttons/button` `Button` component, `CustomModal`, `Dialog` from `@/components/ui/custom-modal`
- Produces: Updated `CreateQuizziSetModal` component matching `StaffModal` layout UX.

- [ ] **Step 1: Update modal wrapper structure and header in `create-quizzi-set-modal.tsx`**

Modify line 273 to use `CustomModal.Content className="w-full max-w-4xl !rounded-[24px]"` and `Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none"`. Update header container to `relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4` with absolute close button `absolute top-5 right-5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700` and `aria-label="Close"`.

- [ ] **Step 2: Update form body scroll container**

Update form container to `<form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">` and wrap form inputs inside `<div className="custom-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-6">`.

- [ ] **Step 3: Fix syntax typo and update footer buttons**

Remove `= {/* Footer Controls */}` on line 606. Move footer outside scrollable div into fixed bottom bar `<div className="flex justify-end gap-3 rounded-b-[24px] border-t border-slate-100 bg-slate-50/60 p-4">`. Use standard `Button` components from `@/components/base/buttons/button`:
```tsx
<Button type="button" color="secondary-gray" size="md" onClick={onClose} isDisabled={isSubmitting}>
    {UI_TEXT.createQuizziSetModal.btnCancel}
</Button>
<Button
    color="primary"
    size="md"
    type="submit"
    isLoading={isSubmitting}
    className="border-none bg-purple-600 px-6 font-bold text-white hover:bg-purple-700"
>
    {isSubmitting
        ? UI_TEXT.createQuizziSetModal.btnSubmitting
        : editQuiz
          ? UI_TEXT.createQuizziSetModal.btnSubmitEdit
          : UI_TEXT.createQuizziSetModal.btnSubmitCreate}
</Button>
```

- [ ] **Step 4: Verify build/type check**

Run `tsc --noEmit` in `lms-portal-admin` workspace to verify no TypeScript or JSX compilation errors exist.

- [ ] **Step 5: Commit changes**

```bash
git add src/components/application/modals/create-quizzi-set-modal.tsx docs/superpowers/specs/2026-08-11-quizzi-modal-sync-design.md docs/superpowers/plans/2026-08-11-quizzi-modal-sync.md
git commit -m "refactor(quizzi-set): synchronize CreateQuizziSetModal layout and buttons with StaffModal pattern"
```
