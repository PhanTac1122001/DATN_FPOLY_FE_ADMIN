# Design Spec: Synchronize Quizzi Set Modal with Staff Modal Pattern

## Overview
The `CreateQuizziSetModal` component (`lms-portal-admin/src/components/application/modals/create-quizzi-set-modal.tsx`) currently exhibits layout inconsistencies compared to the established modal design pattern used in `StaffModal` (`lms-portal-admin/src/components/application/modals/staff-modal.tsx`). 

Specifically, the entire modal container scrolls as a single block (causing the header to scroll out of view), the close button is inline instead of absolute-positioned, a stray `=` syntax artifact exists above the footer controls, and standard UI `Button` components are not utilized for the modal action buttons.

This spec defines the structural alignment of `CreateQuizziSetModal` to match `StaffModal`.

---

## Proposed Changes

### Component: `CreateQuizziSetModal` (`src/components/application/modals/create-quizzi-set-modal.tsx`)

#### 1. Container & Dialog Layout
- Update `CustomModal.Content`:
  - Current: `className="max-w-4xl !rounded-[24px] max-h-[90vh] overflow-y-auto"`
  - Updated: `className="w-full max-w-4xl !rounded-[24px]"`
- Update `Dialog`:
  - Current: `className="flex flex-col rounded-[24px] bg-white shadow-2xl outline-none"`
  - Updated: `className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none"`

#### 2. Fixed Header Section
- Update header container styling:
  - Header element will use `relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4` (or maintain icon + title layout inside relative header).
- Position the close button (`X` icon):
  - Current: `button` in inline flex.
  - Updated: `absolute top-5 right-5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700` with `aria-label="Close"`.

#### 3. Scrollable Form Body
- Form element will take remaining height: `className="flex min-h-0 flex-1 flex-col"`.
- Form body content wrapper: `className="custom-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-6"`.

#### 4. Fixed Footer & Action Buttons
- Remove syntax typo `= ` on line 606 (`= {/* Footer Controls */}`).
- Move footer to bottom of form (outside scrollable body):
  - Wrapper: `className="flex justify-end gap-3 rounded-b-[24px] border-t border-slate-100 bg-slate-50/60 p-4"`.
- Import and use standard `<Button>` from `@/components/base/buttons/button`:
  - Cancel button: `<Button type="button" color="secondary-gray" size="md" onClick={onClose} isDisabled={isSubmitting}>`
  - Submit button: `<Button color="primary" size="md" type="submit" isLoading={isSubmitting} className="border-none bg-purple-600 px-6 font-bold text-white hover:bg-purple-700">`

---

## Verification Plan
1. Verify `CreateQuizziSetModal` renders with fixed header and fixed footer.
2. Confirm scrolling only occurs within the form body.
3. Confirm stray `=` string is gone.
4. Verify Create and Edit modal flows submit correctly and toast notifications function.
