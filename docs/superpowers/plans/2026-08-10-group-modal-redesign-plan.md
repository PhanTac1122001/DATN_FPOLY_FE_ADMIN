# Group Modal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `GroupModal` (`src/components/application/modals/group-modal.tsx`) in `lms-portal-admin` to match `StaffModal` width (`max-w-3xl`), header title/subtitle styling, `Input` base component fields, and footer button styling.

**Architecture:** Update `GroupModal` layout structure to align with `StaffModal` and `SystemModal` patterns, using `Heading`, `Input`, and consistent Tailwind CSS classes.

**Tech Stack:** React 19, Next.js (App Router), Tailwind CSS, TypeScript, `react-aria-components`, `lucide-react`.

## Global Constraints

- Use exact file paths.
- Maintain existing props and state logic in `group-modal.tsx`.
- Follow the design specified in `docs/superpowers/specs/2026-08-10-group-modal-redesign-design.md`.

---

### Task 1: Redesign GroupModal Component Layout and Inputs

**Files:**
- Modify: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\components\application\modals\group-modal.tsx:190-364`

**Interfaces:**
- Consumes: `GroupModalProps` (`isOpen`, `onClose`, `classId`, `groupData`, `availableSubjects`)
- Produces: Redesigned `GroupModal` React component

- [ ] **Step 1: Update Modal Container & Header Structure**

In `src/components/application/modals/group-modal.tsx`, update `CustomModal.Content` to `max-w-3xl !overflow-visible !rounded-[24px]` and replace the header with the standard StaffModal header:
- Header container: `relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4`
- Title: `text-xl font-bold text-slate-900`
- Subtitle: `mt-1 text-xs text-slate-500`
- Close button: `absolute top-5 right-5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700` with `<X className="size-5" />`

- [ ] **Step 2: Update Input Fields & Sections**

Update input fields in `group-modal.tsx`:
- Group Title:
  ```tsx
  <Input
      label={
          <span>
              Tên / Tiêu đề nhóm <span className="font-bold text-red-500">*</span>
          </span>
      }
      value={title}
      onChange={(val: any) => setTitle(typeof val === "string" ? val : val?.target?.value || "")}
      placeholder="Nhập tên nhóm (ví dụ: Nhóm 1 - Fullstack Frontend)"
  />
  ```
- Group Description Textarea:
  ```tsx
  <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700">Mô tả nhóm</label>
      <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả mục tiêu hoặc phân công của nhóm"
          rows={2}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine transition"
      />
  </div>
  ```
- Subject Selection & Student Selection sections with standardized label typography (`text-sm font-semibold text-slate-700`), search inputs, and container styling.

- [ ] **Step 3: Update Modal Footer**

Replace modal footer with StaffModal footer design:
```tsx
<div className="flex justify-end gap-3 rounded-b-[24px] border-t border-slate-100 bg-slate-50/60 p-4">
    <Button type="button" color="secondary-gray" size="md" onClick={onClose} isDisabled={mutation.isPending}>
        Hủy
    </Button>
    <Button
        color="primary"
        size="md"
        type="button"
        onClick={() => mutation.mutate()}
        isLoading={mutation.isPending}
        isDisabled={!title.trim()}
        className="border-none bg-wine px-6 font-bold text-white hover:bg-wine-deep"
    >
        {groupData ? "Cập nhật nhóm" : "Tạo nhóm"}
    </Button>
</div>
```

- [ ] **Step 4: Verify build/typechecking**

Run `tsc --noEmit` or `npm run build` in `lms-portal-admin` to ensure no TypeScript compilation errors.

- [ ] **Step 5: Commit changes**

```bash
git add src/components/application/modals/group-modal.tsx
git commit -m "style(group-modal): redesign group modal width and inputs to match staff modal"
```
